import { useCallback, useMemo, useState } from "react";
import type { FieldError, FieldValidator } from "./types";

export type FormFieldConfig = {
  value: string;
  validate: FieldValidator;
};

export type FormFieldsConfig = Record<string, FormFieldConfig>;

export function useFormValidation<TField extends string>(fields: FormFieldsConfig) {
  const fieldNames = useMemo(() => Object.keys(fields) as TField[], [fields]);

  const [touched, setTouched] = useState<Partial<Record<TField, boolean>>>({});

  const errors = useMemo(() => {
    const next: Partial<Record<TField, FieldError>> = {};
    for (const name of fieldNames) {
      const field = fields[name];
      if (field) next[name] = field.validate(field.value);
    }
    return next;
  }, [fields, fieldNames]);

  const isValid = useMemo(
    () => fieldNames.every((name) => errors[name] === null),
    [errors, fieldNames],
  );

  const touch = useCallback((field: TField) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const touchAll = useCallback(() => {
    setTouched(
      fieldNames.reduce(
        (acc, name) => {
          acc[name] = true;
          return acc;
        },
        {} as Record<TField, boolean>,
      ),
    );
  }, [fieldNames]);

  const showError = useCallback(
    (field: TField) => !!(touched[field] && errors[field]),
    [touched, errors],
  );

  const getError = useCallback((field: TField) => errors[field] ?? null, [errors]);

  return {
    errors,
    touched,
    touch,
    touchAll,
    showError,
    getError,
    isValid,
  };
}
