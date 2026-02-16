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
    select: {
      slots: {
        base: 'rounded-sm h-9',
      },
    },
    selectMenu: {
      slots: {
        base: 'rounded-sm h-9',
      },
    },
    modal: {
      slots: {
        overlay: 'fixed inset-0',
        content: 'bg-default divide-y divide-default flex flex-col focus:outline-none',
        header: 'flex items-center gap-1.5 p-4 sm:px-6 min-h-16',
        wrapper: '',
        body: 'flex-1 p-4 sm:p-6',
        footer: 'flex items-center gap-1.5 p-4 sm:px-6',
        title: 'text-highlighted font-semibold',
        description: 'mt-1 text-muted text-sm',
        close: 'absolute top-4 end-4',
      },
    },
  },
})
