export default defineAppConfig({
  ui: {
    colors: {
      neutral: 'zinc',
    },
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
    pageCard: {
      slots: {
        root: 'hover:ring-primary/25 hover:bg-elevated hover:shadow-inner',
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
