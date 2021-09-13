import React, {useState} from 'react';
import { registerComponent, Components } from '../../lib/vulcan-lib';
import { useSingle } from '../../lib/crud/withSingle';
import { useUpdate } from '../../lib/crud/withUpdate';

export const formCommonStyles = (theme: ThemeType): JssStyles => ({
  formField: {
    marginTop: 12,
    marginBottom: 12,
  },
  leftColumn: {
    minWidth: 140,
    display: "inline-block",
  },
  rightColumn: {
  },
});

export interface LWForm<T> {
  loading: boolean,
  collectionName: CollectionNameString,
  currentValue: T|null,
  updateCurrentValue: (change: Partial<T>)=>void,
}

export function Form<T>({form, children}: {form: LWForm<T>, children: React.ReactNode}) {
  return <form>
    <Components.Typography variant="body2">
      {children}
    </Components.Typography>
  </form>
}

export function useForm<N extends FragmentName, T=FragmentTypes[N]>({currentValue, updateCurrentValue, collectionName, fragmentName, loading=false}: {
  currentValue: T|null,
  updateCurrentValue: (newValue: Partial<T>)=>void,
  collectionName: CollectionNameString,
  fragmentName: N,
  loading?: boolean,
}): LWForm<T>
{
  return {
    loading,
    collectionName,
    currentValue,
    updateCurrentValue,
  };
}

export function useFormComponentContext<FieldType,FormFragment>(form: LWForm<FormFragment>, fieldName: keyof FormFragment): {
  value: FieldType,
  setValue: (newValue: FieldType)=>void
  collectionName: CollectionNameString,
} {
  return {
    value: form.currentValue![fieldName] as unknown as FieldType,
    setValue: (newValue: FieldType) => {
      const change = {[fieldName]: newValue} as unknown as Partial<FormFragment>;
      form.updateCurrentValue(change);
    },
    collectionName: form.collectionName,
  };
}

export function useAutosavingEditForm<N extends FragmentName>({documentId, collectionName, onChange, fragmentName}: {
  documentId: string,
  collectionName: CollectionNameString,
  onChange: (change: Partial<FragmentTypes[N]>)=>void,
  fragmentName: N,
}): LWForm<FragmentTypes[N]> {
  type T = FragmentTypes[N];
  const {document, loading} = useSingle({ collectionName, fragmentName, documentId });
  const {mutate, loading: loadingUpdate} = useUpdate({ collectionName, fragmentName });
  const [currentValue, setCurrentValue] = useState(document);
  
  return useForm<N>({
    loading, currentValue, collectionName, fragmentName,
    updateCurrentValue: async (change: Partial<T>) => {
       setCurrentValue({...currentValue, ...change});
       await mutate({
         selector: {_id: documentId},
         data: change,
       });
       onChange(change);
    },
  });
}
