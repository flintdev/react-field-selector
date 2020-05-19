# react-field-selector

```tsx

interface Field {
  name: string,
  dataType: 'string' | 'integer' | 'boolean' | 'object' | 'array',
  required: boolean,
  children: Field[],
}

type SchemaData = Field[];
<FieldSelector
  schema={schemaData}
  onSelect={(path: string) => void}
/>
```
