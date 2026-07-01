<template>
  <div />
</template>

<script setup>
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const router = useRouter()
onMounted(() => router.replace('/'))
</script>
