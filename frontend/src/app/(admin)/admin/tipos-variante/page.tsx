'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  GripVertical,
  Layers,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { staggerContainer, staggerItem } from '@/lib/utils/animations';
import api from '@/lib/api/client';

interface VariantTypeValue {
  id: string;
  value: string;
  order: number;
  isActive: boolean;
}

interface VariantType {
  id: string;
  name: string;
  description: string | null;
  order: number;
  isActive: boolean;
  values: VariantTypeValue[];
  createdAt: string;
  updatedAt: string;
}

export default function TiposVariantePage() {
  const [variantTypes, setVariantTypes] = useState<VariantType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

  // Modal states for Type
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingType, setEditingType] = useState<VariantType | null>(null);
  const [typeFormData, setTypeFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });

  // Modal states for Value
  const [showValueModal, setShowValueModal] = useState(false);
  const [editingValue, setEditingValue] = useState<VariantTypeValue | null>(null);
  const [valueParentTypeId, setValueParentTypeId] = useState<string | null>(null);
  const [valueFormData, setValueFormData] = useState({
    value: '',
    isActive: true,
  });

  // Delete confirmation
  const [deleteTypeId, setDeleteTypeId] = useState<string | null>(null);
  const [deleteValueId, setDeleteValueId] = useState<string | null>(null);

  // Load variant types
  useEffect(() => {
    loadVariantTypes();
  }, []);

  const loadVariantTypes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<VariantType[]>('/variant-types?includeInactive=true');
      setVariantTypes(data);
    } catch (error) {
      console.error('Error loading variant types:', error);
      toast.error('Error al cargar los tipos de variante');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (typeId: string) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(typeId)) {
      newExpanded.delete(typeId);
    } else {
      newExpanded.add(typeId);
    }
    setExpandedTypes(newExpanded);
  };

  // ==================== TYPE HANDLERS ====================

  const handleOpenTypeModal = (type?: VariantType) => {
    if (type) {
      setEditingType(type);
      setTypeFormData({
        name: type.name,
        description: type.description || '',
        isActive: type.isActive,
      });
    } else {
      setEditingType(null);
      setTypeFormData({
        name: '',
        description: '',
        isActive: true,
      });
    }
    setShowTypeModal(true);
  };

  const handleSaveType = async () => {
    if (!typeFormData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    setLoadingAction(true);
    try {
      if (editingType) {
        await api.patch(`/variant-types/${editingType.id}`, typeFormData);
        toast.success('Tipo de variante actualizado');
      } else {
        await api.post('/variant-types', typeFormData);
        toast.success('Tipo de variante creado');
      }
      setShowTypeModal(false);
      await loadVariantTypes();
    } catch (error: any) {
      console.error('Error saving variant type:', error);
      const message = error?.response?.data?.message || 'Error al guardar';
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteType = async () => {
    if (!deleteTypeId) return;

    setLoadingAction(true);
    try {
      await api.delete(`/variant-types/${deleteTypeId}`);
      toast.success('Tipo de variante eliminado');
      setDeleteTypeId(null);
      await loadVariantTypes();
    } catch (error: any) {
      console.error('Error deleting variant type:', error);
      const message = error?.response?.data?.message || 'Error al eliminar';
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoadingAction(false);
    }
  };

  // ==================== VALUE HANDLERS ====================

  const handleOpenValueModal = (typeId: string, value?: VariantTypeValue) => {
    setValueParentTypeId(typeId);
    if (value) {
      setEditingValue(value);
      setValueFormData({
        value: value.value,
        isActive: value.isActive,
      });
    } else {
      setEditingValue(null);
      setValueFormData({
        value: '',
        isActive: true,
      });
    }
    setShowValueModal(true);
  };

  const handleSaveValue = async () => {
    if (!valueFormData.value.trim()) {
      toast.error('El valor es requerido');
      return;
    }

    if (!valueParentTypeId) return;

    setLoadingAction(true);
    try {
      if (editingValue) {
        await api.patch(`/variant-types/values/${editingValue.id}`, valueFormData);
        toast.success('Valor actualizado');
      } else {
        await api.post(`/variant-types/${valueParentTypeId}/values`, valueFormData);
        toast.success('Valor agregado');
      }
      setShowValueModal(false);
      await loadVariantTypes();
    } catch (error: any) {
      console.error('Error saving value:', error);
      const message = error?.response?.data?.message || 'Error al guardar';
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteValue = async () => {
    if (!deleteValueId) return;

    setLoadingAction(true);
    try {
      await api.delete(`/variant-types/values/${deleteValueId}`);
      toast.success('Valor eliminado');
      setDeleteValueId(null);
      await loadVariantTypes();
    } catch (error: any) {
      console.error('Error deleting value:', error);
      const message = error?.response?.data?.message || 'Error al eliminar';
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Tipos de Variante
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Gestiona los tipos de variante y sus valores (Talla: S, M, L, XL)
          </p>
        </div>
        <Button onClick={() => handleOpenTypeModal()} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Tipo
        </Button>
      </motion.div>

      {/* Content */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Tipos de Variante
            </CardTitle>
            <CardDescription>
              Haz clic en un tipo para ver y gestionar sus valores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : variantTypes.length === 0 ? (
              <div className="text-center py-12">
                <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  No hay tipos de variante configurados
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                  Crea tipos como Talla, Color, Material, etc.
                </p>
                <Button onClick={() => handleOpenTypeModal()} className="mt-4 gap-2">
                  <Plus className="w-4 h-4" />
                  Crear Primer Tipo
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {variantTypes.map((type) => (
                  <div
                    key={type.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    {/* Type Row */}
                    <div
                      className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => toggleExpand(type.id)}
                    >
                      <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />

                      {expandedTypes.has(type.id) ? (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{type.name}</span>
                          <Badge variant={type.isActive ? 'default' : 'secondary'} className="text-xs">
                            {type.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {type.values.length} valores
                          </Badge>
                        </div>
                        {type.description && (
                          <p className="text-sm text-slate-500 mt-0.5">{type.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenTypeModal(type)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => setDeleteTypeId(type.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Values Panel */}
                    <AnimatePresence>
                      {expandedTypes.has(type.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 bg-white dark:bg-slate-900 border-t">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Valores de {type.name}
                              </h4>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenValueModal(type.id)}
                                className="gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                Agregar Valor
                              </Button>
                            </div>

                            {type.values.length === 0 ? (
                              <div className="text-center py-6 text-slate-400">
                                <p className="text-sm">No hay valores configurados</p>
                                <p className="text-xs mt-1">Agrega valores como S, M, L, XL, etc.</p>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {type.values.map((value) => (
                                  <div
                                    key={value.id}
                                    className={`
                                      inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm
                                      ${value.isActive
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                      }
                                    `}
                                  >
                                    <span>{value.value}</span>
                                    <button
                                      onClick={() => handleOpenValueModal(type.id, value)}
                                      className="p-0.5 hover:bg-black/10 rounded"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => setDeleteValueId(value.id)}
                                      className="p-0.5 hover:bg-black/10 rounded text-red-500"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create/Edit Type Modal */}
      <Dialog open={showTypeModal} onOpenChange={setShowTypeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingType ? 'Editar Tipo de Variante' : 'Nuevo Tipo de Variante'}
            </DialogTitle>
            <DialogDescription>
              {editingType
                ? 'Actualiza la información del tipo de variante'
                : 'Crea un nuevo tipo de variante (ej: Talla, Color, Material)'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="typeName">Nombre *</Label>
              <Input
                id="typeName"
                placeholder="Ej: Talla, Color, Material, Tamaño"
                value={typeFormData.name}
                onChange={(e) => setTypeFormData({ ...typeFormData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="typeDescription">Descripción</Label>
              <Textarea
                id="typeDescription"
                placeholder="Descripción opcional del tipo"
                value={typeFormData.description}
                onChange={(e) => setTypeFormData({ ...typeFormData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="typeIsActive">Estado</Label>
                <p className="text-sm text-slate-500">
                  Los tipos inactivos no aparecen en los formularios
                </p>
              </div>
              <Switch
                id="typeIsActive"
                checked={typeFormData.isActive}
                onCheckedChange={(checked) => setTypeFormData({ ...typeFormData, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTypeModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveType} disabled={loadingAction}>
              {loadingAction && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingType ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Value Modal */}
      <Dialog open={showValueModal} onOpenChange={setShowValueModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingValue ? 'Editar Valor' : 'Agregar Valor'}
            </DialogTitle>
            <DialogDescription>
              {editingValue
                ? 'Actualiza el valor'
                : 'Agrega un nuevo valor (ej: S, M, L, XL, Negro, Blanco)'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="valueName">Valor *</Label>
              <Input
                id="valueName"
                placeholder="Ej: S, M, L, XL, Negro, Blanco"
                value={valueFormData.value}
                onChange={(e) => setValueFormData({ ...valueFormData, value: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="valueIsActive">Estado</Label>
                <p className="text-sm text-slate-500">
                  Los valores inactivos no aparecen en los selectores
                </p>
              </div>
              <Switch
                id="valueIsActive"
                checked={valueFormData.isActive}
                onCheckedChange={(checked) => setValueFormData({ ...valueFormData, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowValueModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveValue} disabled={loadingAction}>
              {loadingAction && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingValue ? 'Guardar' : 'Agregar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Type Confirmation */}
      <AlertDialog open={!!deleteTypeId} onOpenChange={() => setDeleteTypeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tipo de variante?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán también todos los valores asociados.
              Si el tipo está siendo usado por productos, no podrá ser eliminado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteType}
              className="bg-red-500 hover:bg-red-600"
            >
              {loadingAction && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Value Confirmation */}
      <AlertDialog open={!!deleteValueId} onOpenChange={() => setDeleteValueId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar valor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteValue}
              className="bg-red-500 hover:bg-red-600"
            >
              {loadingAction && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
