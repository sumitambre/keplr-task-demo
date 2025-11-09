export const clientFormSchema = {
  title: 'Client',
  sections: [
    {
      key: 'root',
      title: 'Client Information',
      fields: [
        { key: 'name', label: 'Client Name', type: 'text', required: true },
        { key: 'contactPerson', label: 'Main Contact Person', type: 'text' },
        { key: 'phone', label: 'Main Phone', type: 'tel' }
      ]
    },
    {
      key: 'sites',
      title: 'Sites',
      repeatable: true,
      fields: [
        { key: 'name', label: 'Site Name', type: 'text', required: true },
        { key: 'siteContactPerson', label: 'Site Contact Person', type: 'text' },
        { key: 'siteContactPosition', label: 'Position', type: 'text' },
        { key: 'contactNumber', label: 'Number', type: 'tel' },
        { key: 'address', label: 'Site Address', type: 'textarea' },
        { key: 'googleMapsLink', label: 'Google Maps Link', type: 'text' }
      ]
    }
  ]
};