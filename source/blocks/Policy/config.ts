import { Block } from "payload";

export const Policy: Block = {
  slug: 'policy',
  interfaceName: "PolicyBlock",
  fields: [
    {
      name: "policyTitle",
      label: "Policy Title",
      type: "text",
      required: true,
    },
    {
      name: "policyDescription",
      label: "Policy Description",
      type: "textarea",
    },
    {
      name: 'policies',
      label: 'Policies',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'icon',
          label: 'Icon',
          type: 'select',
          defaultValue: 'RotateCcw',
          options: [
            { label: 'Returns', value: 'RotateCcw' },
            { label: 'Shield', value: 'ShieldCheck' },
            { label: 'Truck', value: 'Truck' },
            { label: 'Exchange', value: 'RefreshCw' },
            { label: 'Clock', value: 'Clock' },
            { label: 'Package', value: 'Package' },
            { label: 'Refund', value: 'CreditCard' },
            { label: 'Support', value: 'MessageCircle' },
            { label: 'Info', value: 'Info' },
            { label: 'Check', value: 'CheckCircle' },
            { label: 'Alert', value: 'AlertCircle' },
          ],
        },
        {
          name: 'title',
          label: 'Title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
          required: true,
        },
      ],
    },
  ],
}
