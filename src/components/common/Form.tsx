'use client'

import React from 'react';
import { useForm, UseFormProps, FieldValues } from 'react-hook-form';

interface FormProps<T extends FieldValues> extends UseFormProps<T> {
  onSubmit: (data: T) => void;
  children: React.ReactNode;
}

export function Form<T extends FieldValues>({ onSubmit, children, ...formProps }: FormProps<T>) {
  const { register, handleSubmit, formState: { errors } } = useForm<T>(formProps);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {React.Children.map(children, (child: React.ReactNode) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            register,
            errors,
          });
        }
        return child;
      })}
    </form>
  );
} 