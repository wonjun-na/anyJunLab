<template>
  <v-app>
    <!-- 상단 메뉴 -->
    <v-app-bar elevation="1">
      <v-container class="d-flex align-center">
        <v-icon
          icon="mdi-flask-outline"
          size="30"
          class="mr-3"
        />

        <v-app-bar-title class="font-weight-bold text-title-medium text-sm-title-large">
          <router-link to="/" class="text-decoration-none color-inherit text-high-emphasis">
            AnyJunLab
          </router-link>
        </v-app-bar-title>
        
        <v-spacer />

        <v-app-bar-nav-icon @click="drawer = !drawer" />

      </v-container>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" location="right" temporary>
      <v-list nav class="pa-4">
        <v-list-item prepend-icon="mdi-calculator" title="대출 계산기" value="loan" to="/loan"rounded="lg"/>
        <v-list-item prepend-icon="mdi-cash-multiple" title="DSR/DTI/LTV" value="loan" to="/ddl"rounded="lg"/>
      </v-list>
    </v-navigation-drawer>

    <!-- 가운데 화면 (URL에 맞춰 라우터가 렌더링) -->
    <v-main>
      <router-view />
    </v-main>

    <!-- 하단 Footer -->
    <v-footer
      class="text-center d-flex justify-center"
      border
    >
      <span class="text-caption text-medium-emphasis">
        © 2026 AnyJunLab
      </span>
    </v-footer>
  </v-app>
</template>

<script setup>
// 라우터가 페이지를 자동으로 제어하므로 스크립트 영역은 비워두셔도 됩니다.
import { ref } from 'vue'
const drawer = ref(false)
</script>