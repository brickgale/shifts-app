<script setup lang="ts">
import { type ButtonProps } from '@nuxt/ui'
const colorMode = useColorMode()

const props = withDefaults(
  defineProps<{
    color?: ButtonProps['color']
    variant?: ButtonProps['variant']
    class?: string
  }>(),
  {
    color: 'primary',
    variant: 'ghost',
    class: '',
  }
)

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set(_isDark) {
    colorMode.preference = _isDark ? 'dark' : 'light'
  },
})
</script>

<template>
  <ClientOnly v-if="!colorMode?.forced">
    <UButton
      :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
      :color="props.color"
      :variant="props.variant"
      :class="props.class"
      :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
      @click="isDark = !isDark"
    />

    <template #fallback>
      <div class="size-8" />
    </template>
  </ClientOnly>
</template>
