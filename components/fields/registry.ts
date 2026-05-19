import { ComponentType } from 'react';
import { FileFieldProps } from './FileField';
import FileField from './FileField';

type FieldComponent = ComponentType<FileFieldProps>;

const registry: Record<string, FieldComponent> = {
  file:        FileField,
  image:       FileField,
  multi_image: FileField,
};

export function getFieldComponent(fieldType: string): FieldComponent | null {
  return registry[fieldType] ?? null;
}
