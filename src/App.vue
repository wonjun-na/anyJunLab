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

        <v-app-bar-title class="font-weight-bold">
          AnyJunLab
        </v-app-bar-title>

        <v-spacer />

        <v-btn
          variant="text"
          to="/"
        >
          홈
        </v-btn>

        <v-btn
          variant="text"
          prepend-icon="mdi-calculator-variant"
          to="/loan"
        >
          대출이자계산기
        </v-btn>
      </v-container>
    </v-app-bar>

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
</script>