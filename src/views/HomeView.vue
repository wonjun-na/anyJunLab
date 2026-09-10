<template>
  <v-container
    class="fill-height"
    style="min-height: calc(100vh - 128px)"
  >
    <v-row
      align="center"
      justify="center"
      class="w-100"
    >
      <v-col
        cols="12"
        md="8"
        lg="6"
      >
        <v-card
          elevation="2"
          rounded="xl"
          class="pa-8 text-center"
        >
          <v-avatar
            size="80"
            color="primary"
            class="mb-6"
          >
            <v-icon
              icon="mdi-flask-outline"
              size="42"
            />
          </v-avatar>

          <h1 class="text-h4 font-weight-bold mb-4">
            AnyJunLab에 오신 것을 환영합니다.
          </h1>

          <p class="text-body-1 text-medium-emphasis">
            다양한 아이디어와 유용한 도구를 연구하고 만들어가는
            작은 연구소입니다.
          </p>

          <p class="text-body-2 text-medium-emphasis mt-3">
            필요한 도구를 하나씩 만들어가겠습니다.
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>