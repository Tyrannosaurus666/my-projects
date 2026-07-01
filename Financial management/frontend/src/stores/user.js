import { defineStore } from 'pinia'
import { userApi } from '../api'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null,
    username: '',
    nickname: '',
    email: '',
    avatar: ''
  }),
  actions: {
    async fetchUserInfo() {
      try {
        const data = await userApi.getInfo()
        this.id = data.id
        this.username = data.username
        this.nickname = data.nickname
        this.email = data.email
        this.avatar = data.avatar
      } catch (e) {
        console.error('获取用户信息失败', e)
      }
    },
    logout() {
      localStorage.removeItem('token')
      this.$reset()
    }
  }
})
