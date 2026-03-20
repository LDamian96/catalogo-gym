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
  X,
  Filter,
  Home,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
  showAsFilter: boolean;
  showInLanding: boolean;
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
    showAsFilter: false,
    showInLanding: false,
  });

  // Modal states for Value
  const [showValueModal, setShowValueModal] = useState(false);
  const [editingValue, setEditingValue] = useState<VariantTypeValue | null>(null);
  const [valueParentTypeId, setValueParentTypeId] = useState<string | null>(null);
  const [valueFormData, setValueFormData] = useState({
    value: '',
    isActive: true,
  });
  const [bulkValues, setBulkValues] = useState(''); // Para agregar múltiples valores

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
        showAsFilter: type.showAsFilter,
        showInLanding: type.showInLanding,
      });
    } else {
      setEditingType(null);
      setTypeFormData({
        name: '',
        description: '',
        isActive: true,
        showAsFilter: false,
        showInLanding: false,
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
    } catch (error: unknown) {
      console.error('Error saving variant type:', error);
      const axiosError = error as { response?: { data?: { message?: string | string[] } } };
      const message = axiosError?.response?.data?.message || 'Error al guardar';
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
    } catch (error: unknown) {
      console.error('Error deleting variant type:', error);
      const axiosError = error as { response?: { data?: { message?: string | string[] } } };
      const message = axiosError?.response?.data?.message || 'Error al eliminar';
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
      setBulkValues('');
    } else {
      setEditingValue(null);
      setValueFormData({
        value: '',
        isActive: true,
      });
      setBulkValues('');
    }
    setShowValueModal(true);
  };

  const handleSaveValue = async () => {
    if (!valueParentTypeId) return;

    setLoadingAction(true);
    try {
      if (editingValue) {
        // Editando un valor existente
        if (!valueFormData.value.trim()) {
          toast.error('El valor es requerido');
          setLoadingAction(false);
          return;
        }
        await api.patch(`/variant-types/values/${editingValue.id}`, valueFormData);
        toast.success('Valor actualizado');
      } else {
        // Creando nuevos valores (puede ser múltiples separados por coma)
        const inputValues = bulkValues.trim();
        if (!inputValues) {
          toast.error('Ingresa al menos un valor');
          setLoadingAction(false);
          return;
        }

        // Parsear valores separados por coma
        const valuesToCreate = inputValues
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v.length > 0);

        if (valuesToCreate.length === 0) {
          toast.error('Ingresa al menos un valor válido');
          setLoadingAction(false);
          return;
        }

        // Crear cada valor
        let created = 0;
        let errors = 0;
        for (const val of valuesToCreate) {
          try {
            await api.post(`/variant-types/${valueParentTypeId}/values`, {
              value: val,
              isActive: true,
            });
            created++;
          } catch {
            errors++;
          }
        }

        if (created > 0) {
          toast.success(`${created} valor${created > 1 ? 'es' : ''} agregado${created > 1 ? 's' : ''}`);
        }
        if (errors > 0) {
          toast.error(`${errors} valor${errors > 1 ? 'es' : ''} no se pudo crear (posiblemente duplicado${errors > 1 ? 's' : ''})`);
        }
      }
      setShowValueModal(false);
      await loadVariantTypes();
    } catch (error: unknown) {
      console.error('Error saving value:', error);
      const axiosError = error as { response?: { data?: { message?: string | string[] } } };
      const message = axiosError?.response?.data?.message || 'Error al guardar';
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
    } catch (error: unknown) {
      console.error('Error deleting value:', error);
      const axiosError = error as { response?: { data?: { message?: string | string[] } } };
      const message = axiosError?.response?.data?.message || 'Error al eliminar';
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
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Atributos
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
            Gestiona los atributos y sus valores
          </p>
        </div>
        <Button
          onClick={() => handleOpenTypeModal()}
          className="gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 shadow-md shadow-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/30 transition-shadow flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo Atributo</span>
          <span className="sm:hidden">Nuevo</span>
        </Button>
      </motion.div>

      {/* Content */}
      <motion.div variants={staggerItem}>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-4 sm:p-5 animate-pulse"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <Skeleton className="h-5 w-24 sm:w-32" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <div className="flex-1" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
                <div className="mt-3 flex gap-2">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-7 w-14 rounded-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : variantTypes.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-white/[0.06] mb-5">
              <Layers className="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 font-medium">
              No hay atributos configurados
            </p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1.5 max-w-sm mx-auto">
              Crea atributos como Talla, Color, Material, etc.
            </p>
            <Button
              onClick={() => handleOpenTypeModal()}
              className="mt-6 gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              Crear Primer Atributo
            </Button>
          </div>
        ) : (
          /* Attribute Cards */
          <div className="space-y-3">
            {variantTypes.map((type) => (
              <div
                key={type.id}
                className="rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] overflow-hidden transition-all duration-200 hover:border-neutral-300 dark:hover:border-white/[0.12] hover:shadow-sm"
              >
                {/* Type Row */}
                <div
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 cursor-pointer"
                  onClick={() => toggleExpand(type.id)}
                >
                  <div className="hidden sm:block">
                    <GripVertical className="w-4 h-4 text-neutral-300 dark:text-neutral-600 cursor-grab" />
                  </div>

                  <div className="transition-transform duration-200 flex-shrink-0" style={{ transform: expandedTypes.has(type.id) ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
                      <span className="font-bold text-neutral-900 dark:text-white text-sm sm:text-base">{type.name}</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full ${
                          type.isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'bg-neutral-100 text-neutral-500 dark:bg-white/[0.06] dark:text-neutral-400'
                        }`}
                      >
                        {type.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full bg-neutral-100 text-neutral-600 dark:bg-white/[0.06] dark:text-neutral-400">
                        {type.values.length} val.
                      </span>
                      {type.showAsFilter && (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400">
                          <Filter className="w-3 h-3" />
                          Filtro
                        </span>
                      )}
                      {type.showInLanding && (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400">
                          <Home className="w-3 h-3" />
                          Landing
                        </span>
                      )}
                    </div>
                    {type.description && (
                      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 sm:mt-1 truncate">{type.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 h-8 w-8"
                      onClick={() => handleOpenTypeModal(type)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-neutral-400 hover:text-red-500 h-8 w-8"
                      onClick={() => setDeleteTypeId(type.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 sm:px-5 sm:pb-5 pt-0">
                        <div className="bg-neutral-50 dark:bg-white/[0.02] rounded-xl p-3 sm:p-4 border border-neutral-100 dark:border-white/[0.05]">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300">
                              Valores de {type.name}
                            </h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenValueModal(type.id)}
                              className="gap-1 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-500/10 h-8 text-xs"
                            >
                              <Plus className="w-3 h-3" />
                              Agregar
                            </Button>
                          </div>

                          {type.values.length === 0 ? (
                            <div className="text-center py-6 text-neutral-400">
                              <p className="text-sm">No hay valores configurados</p>
                              <p className="text-xs mt-1 text-neutral-400 dark:text-neutral-500">Agrega valores como S, M, L, XL, etc.</p>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {type.values.map((value) => (
                                <div
                                  key={value.id}
                                  className={`
                                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                                    ${value.isActive
                                      ? 'bg-neutral-100 text-neutral-700 dark:bg-white/[0.08] dark:text-neutral-300'
                                      : 'bg-neutral-50 text-neutral-400 dark:bg-white/[0.03] dark:text-neutral-500 line-through'
                                    }
                                  `}
                                >
                                  <span>{value.value}</span>
                                  <button
                                    onClick={() => handleOpenValueModal(type.id, value)}
                                    className="p-0.5 hover:bg-neutral-200 dark:hover:bg-white/[0.1] rounded-full transition-colors"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteValueId(value.id)}
                                    className="p-0.5 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-full text-red-400 hover:text-red-500 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create/Edit Type Modal */}
      <Dialog open={showTypeModal} onOpenChange={setShowTypeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingType ? 'Editar Atributo' : 'Nuevo Atributo'}
            </DialogTitle>
            <DialogDescription>
              {editingType
                ? 'Actualiza la información del atributo'
                : 'Crea un nuevo atributo (ej: Talla, Color, Material, Sabor)'}
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
                <p className="text-sm text-neutral-500">
                  Los tipos inactivos no aparecen en los formularios
                </p>
              </div>
              <Switch
                id="typeIsActive"
                checked={typeFormData.isActive}
                onCheckedChange={(checked) => setTypeFormData({ ...typeFormData, isActive: checked })}
              />
            </div>

            <div className="border-t border-neutral-200 dark:border-white/[0.08] pt-4 mt-4">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                Opciones de Filtro
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showAsFilter">Mostrar en Filtros</Label>
                    <p className="text-sm text-neutral-500">
                      Aparecerá como filtro en /productos y categorías
                    </p>
                  </div>
                  <Switch
                    id="showAsFilter"
                    checked={typeFormData.showAsFilter}
                    onCheckedChange={(checked) => setTypeFormData({ ...typeFormData, showAsFilter: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showInLanding">Mostrar en Landing</Label>
                    <p className="text-sm text-neutral-500">
                      Aparecerá en la página principal del catálogo
                    </p>
                  </div>
                  <Switch
                    id="showInLanding"
                    checked={typeFormData.showInLanding}
                    onCheckedChange={(checked) => setTypeFormData({ ...typeFormData, showInLanding: checked })}
                  />
                </div>
              </div>
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
              {editingValue ? 'Editar Valor' : 'Agregar Valores'}
            </DialogTitle>
            <DialogDescription>
              {editingValue
                ? 'Actualiza el valor'
                : 'Agrega uno o varios valores separados por coma'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {editingValue ? (
              // Modo edición: solo un valor
              <>
                <div>
                  <Label htmlFor="valueName">Valor *</Label>
                  <Input
                    id="valueName"
                    placeholder="Ej: S, M, L"
                    value={valueFormData.value}
                    onChange={(e) => setValueFormData({ ...valueFormData, value: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="valueIsActive">Estado</Label>
                    <p className="text-sm text-neutral-500">
                      Los valores inactivos no aparecen en los selectores
                    </p>
                  </div>
                  <Switch
                    id="valueIsActive"
                    checked={valueFormData.isActive}
                    onCheckedChange={(checked) => setValueFormData({ ...valueFormData, isActive: checked })}
                  />
                </div>
              </>
            ) : (
              // Modo creación: múltiples valores
              <div>
                <Label htmlFor="bulkValues">Valores (separados por coma) *</Label>
                <Textarea
                  id="bulkValues"
                  placeholder="Ej: S, M, L, XL, XXL"
                  value={bulkValues}
                  onChange={(e) => setBulkValues(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Escribe varios valores separados por coma para agregarlos todos de una vez.
                  <br />
                  Ejemplo: <span className="font-medium">S, M, L, XL</span> o <span className="font-medium">Rojo, Azul, Verde, Negro</span>
                </p>
                {bulkValues.trim() && (
                  <div className="mt-3 p-3 bg-neutral-50 dark:bg-white/[0.03] rounded-xl border border-neutral-100 dark:border-white/[0.05]">
                    <p className="text-xs text-neutral-500 mb-2">Vista previa:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {bulkValues.split(',').map((v) => v.trim()).filter(v => v).map((v, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-neutral-100 text-neutral-700 dark:bg-white/[0.08] dark:text-neutral-300">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowValueModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveValue} disabled={loadingAction}>
              {loadingAction && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingValue ? 'Guardar' : 'Agregar Valores'}
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
