'use client';

import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';

interface SEOFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  titleField?: string;
  descriptionField?: string;
  keywordsField?: string;
  showCard?: boolean;
}

export function SEOFields({
  form,
  titleField = 'seoTitle',
  descriptionField = 'seoDescription',
  keywordsField = 'seoKeywords',
  showCard = true,
}: SEOFieldsProps) {
  const content = (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={titleField}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título SEO</FormLabel>
            <FormControl>
              <Input
                placeholder="Título para motores de búsqueda"
                maxLength={70}
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormDescription>
              {(field.value?.length || 0)}/70 caracteres
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={descriptionField}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción SEO</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descripción para motores de búsqueda"
                maxLength={160}
                rows={3}
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormDescription>
              {(field.value?.length || 0)}/160 caracteres
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={keywordsField}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Palabras clave</FormLabel>
            <FormControl>
              <Input
                placeholder="palabra1, palabra2, palabra3"
                maxLength={200}
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormDescription>
              Separadas por comas
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-lg">SEO</CardTitle>
            <CardDescription>
              Optimiza cómo aparece en buscadores
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
