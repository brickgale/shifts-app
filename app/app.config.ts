export default defineAppConfig({
  theme: {
    primaryColor: 'indigo',
  },
  ui: {
    button: {
      slots: {
        base: 'cursor-pointer',
      },
    },
    card: {
      slots: {
        root: 'rounded-sm',
      },
    },
    formField: {
      variants: {
        required: {
          true: {
            label: 'after:ms-1.5',
          },
        },
      },
    },
    input: {
      slots: {
        base: 'rounded-sm',
      },
      variants: {
        size: {
          md: {
            base: 'px-3 py-2',
          },
        },
      },
    },
  },
})
