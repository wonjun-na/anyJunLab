<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const canvasRef = ref(null)

const name = ref('홍길동')
const style = ref('natural')
const fontSize = ref(100)
const fontWeight = ref(500)
const italic = ref(0)

const inkColor = ref('#222222')
const backgroundColor = ref('#FFFFFF')
const transparentBackground = ref(true)

const canvasWidth = 1200
const canvasHeight = 500

const signatureStyles = [
  {
    title: '자연스러운',
    value: 'natural',
    icon: 'mdi-pen',
    description: '부드러운 필기체'
  },
  {
    title: '클래식',
    value: 'classic',
    icon: 'mdi-fountain-pen',
    description: '우아하고 개성 있는 느낌'
  },
  {
    title: '비즈니스',
    value: 'business',
    icon: 'mdi-briefcase-outline',
    description: '깔끔하고 전문적인 느낌'
  },
  {
    title: '심플',
    value: 'simple',
    icon: 'mdi-format-letter-case',
    description: '간결하고 현대적인 느낌'
  }
]

const inkColors = [
  '#111111',
  '#222222',
  '#1A237E',
  '#263238',
  '#37474F',
  '#5D4037'
]

const selectedStyle = computed(() => {
  return signatureStyles.find(
    item => item.value === style.value
  )
})

const fontFamily = computed(() => {
  switch (style.value) {
    case 'classic':
      return '"Brush Script MT", "Segoe Script", cursive'

    case 'business':
      return '"Segoe Print", "Malgun Gothic", cursive'

    case 'simple':
      return '"Malgun Gothic", sans-serif'

    default:
      return '"Segoe Print", "Malgun Gothic", cursive'
  }
})

const drawSignature = async () => {
  await nextTick()

  const canvas = canvasRef.value

  if (!canvas) {
    return
  }

  const ctx = canvas.getContext('2d')

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  )

  if (!transparentBackground.value) {
    ctx.fillStyle = backgroundColor.value
    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    )
  }

  if (!name.value.trim()) {
    return
  }

  let fontStyle = ''

  if (italic.value > 0) {
    fontStyle += 'italic '
  }

  fontStyle += `${fontWeight.value} ${fontSize.value}px ${fontFamily.value}`

  ctx.font = fontStyle
  ctx.fillStyle = inkColor.value
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.imageSmoothingEnabled = true

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2

  switch (style.value) {
    case 'classic':
      drawClassic(ctx, centerX, centerY)
      break

    case 'business':
      drawBusiness(ctx, centerX, centerY)
      break

    case 'simple':
      drawSimple(ctx, centerX, centerY)
      break

    default:
      drawNatural(ctx, centerX, centerY)
      break
  }
}

const drawNatural = (ctx, x, y) => {
  ctx.save()

  ctx.translate(x, y)
  ctx.rotate(-0.04)

  ctx.fillText(
    name.value,
    0,
    0
  )

  ctx.beginPath()
  ctx.moveTo(-260, 70)

  ctx.quadraticCurveTo(
    0,
    105,
    270,
    55
  )

  ctx.strokeStyle = inkColor.value
  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  ctx.stroke()

  ctx.restore()
}

const drawClassic = (ctx, x, y) => {
  ctx.save()

  ctx.translate(x, y)
  ctx.rotate(-0.06)

  ctx.fillText(
    name.value,
    0,
    0
  )

  ctx.beginPath()

  ctx.moveTo(-280, 75)

  ctx.bezierCurveTo(
    -120,
    115,
    140,
    100,
    300,
    30
  )

  ctx.strokeStyle = inkColor.value
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.stroke()

  ctx.restore()
}

const drawBusiness = (ctx, x, y) => {
  ctx.save()

  ctx.translate(x, y)

  ctx.fillText(
    name.value,
    0,
    0
  )

  ctx.beginPath()

  ctx.moveTo(-250, 65)
  ctx.lineTo(250, 65)

  ctx.strokeStyle = inkColor.value
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.stroke()

  ctx.restore()
}

const drawSimple = (ctx, x, y) => {
  ctx.save()

  ctx.translate(x, y)

  ctx.fillText(
    name.value,
    0,
    0
  )

  ctx.restore()
}

const randomizeSignature = async () => {
  const styles = signatureStyles.map(
    item => item.value
  )

  style.value =
    styles[Math.floor(Math.random() * styles.length)]

  fontSize.value =
    Math.floor(Math.random() * 25) + 85

  fontWeight.value =
    Math.floor(Math.random() * 4) * 100 + 400

  italic.value =
    Math.floor(Math.random() * 20)

  await drawSignature()
}

const downloadPng = () => {
  const canvas = canvasRef.value

  if (!canvas) {
    return
  }

  const link = document.createElement('a')

  link.download =
    `${name.value || 'signature'}-signature.png`

  link.href =
    canvas.toDataURL('image/png')

  link.click()
}

const reset = async () => {
  name.value = '홍길동'
  style.value = 'natural'
  fontSize.value = 100
  fontWeight.value = 500
  italic.value = 0

  inkColor.value = '#222222'
  backgroundColor.value = '#FFFFFF'
  transparentBackground.value = true

  await drawSignature()
}

watch(
  [
    name,
    style,
    fontSize,
    fontWeight,
    italic,
    inkColor,
    backgroundColor,
    transparentBackground
  ],
  () => {
    drawSignature()
  }
)

onMounted(() => {
  drawSignature()
})
</script>

<template>
  <v-app>
    <v-main class="bg-grey-lighten-4">

      <v-container class="py-8">

        <!-- 제목 -->

        <div class="mb-8">

          <v-chip
            color="primary"
            variant="tonal"
            prepend-icon="mdi-draw-pen"
            class="mb-4"
          >
            디자인 도구
          </v-chip>

          <h1
            class="text-h4 text-md-h3 font-weight-bold mb-3"
          >
            사인 이미지 만들기
          </h1>

          <p
            class="text-body-1 text-medium-emphasis"
          >
            이름과 스타일을 선택하면 나만의 사인 이미지를 만들 수 있습니다.
          </p>

        </div>


        <!-- 사인 설정 -->

        <v-card
          elevation="1"
          rounded="xl"
          class="pa-5 pa-md-7 mb-6"
        >

          <div class="d-flex align-center mb-6">

            <v-icon
              icon="mdi-draw-pen"
              color="primary"
              class="mr-2"
            />

            <h2 class="text-h6 font-weight-bold">
              사인 설정
            </h2>

            <v-spacer />

            <v-btn
              variant="text"
              size="small"
              prepend-icon="mdi-refresh"
              @click="reset"
            >
              초기화
            </v-btn>

          </div>


          <v-row>

            <!-- 이름 -->

            <v-col
              cols="12"
              md="6"
            >

              <v-text-field
                v-model="name"
                label="이름"
                placeholder="사인에 사용할 이름"
                variant="outlined"
                prepend-inner-icon="mdi-account-outline"
                hide-details
              />

            </v-col>


            <!-- 색상 -->

            <v-col
              cols="12"
              md="6"
            >

              <div class="text-subtitle-2 font-weight-bold mb-2">
                사인 색상
              </div>

              <div class="d-flex align-center ga-2">

                <v-btn
                  v-for="color in inkColors"
                  :key="color"
                  :variant="
                    inkColor === color
                      ? 'flat'
                      : 'outlined'
                  "
                  :color="color"
                  size="36"
                  icon
                  @click="inkColor = color"
                >
                  <v-icon
                    v-if="inkColor === color"
                    icon="mdi-check"
                    size="18"
                    color="white"
                  />
                </v-btn>

                <v-text-field
                  v-model="inkColor"
                  type="color"
                  density="compact"
                  variant="outlined"
                  hide-details
                  style="max-width: 55px"
                />

              </div>

            </v-col>


            <!-- 스타일 -->

            <v-col cols="12">

              <div class="text-subtitle-2 font-weight-bold mb-3">
                사인 스타일
              </div>

              <v-row>

                <v-col
                  v-for="item in signatureStyles"
                  :key="item.value"
                  cols="12"
                  sm="6"
                  md="3"
                >

                  <v-card
                    :variant="
                      style === item.value
                        ? 'tonal'
                        : 'outlined'
                    "
                    :color="
                      style === item.value
                        ? 'primary'
                        : undefined
                    "
                    rounded="lg"
                    class="pa-4"
                    :elevation="
                      style === item.value
                        ? 2
                        : 0
                    "
                    @click="style = item.value"
                  >

                    <div class="d-flex align-center mb-2">

                      <v-icon
                        :icon="item.icon"
                        size="24"
                        class="mr-2"
                      />

                      <span class="font-weight-bold">
                        {{ item.title }}
                      </span>

                    </div>

                    <div class="text-caption text-medium-emphasis">
                      {{ item.description }}
                    </div>

                  </v-card>

                </v-col>

              </v-row>

            </v-col>


            <!-- 글자 크기 -->

            <v-col
              cols="12"
              md="4"
            >

              <div
                class="d-flex justify-space-between text-subtitle-2 font-weight-bold"
              >

                <span>
                  글자 크기
                </span>

                <span class="text-primary">
                  {{ fontSize }}px
                </span>

              </div>

              <v-slider
                v-model="fontSize"
                min="60"
                max="160"
                step="1"
                color="primary"
                thumb-label
                hide-details
              />

            </v-col>


            <!-- 굵기 -->

            <v-col
              cols="12"
              md="4"
            >

              <div
                class="d-flex justify-space-between text-subtitle-2 font-weight-bold"
              >

                <span>
                  글자 굵기
                </span>

                <span class="text-primary">
                  {{ fontWeight }}
                </span>

              </div>

              <v-slider
                v-model="fontWeight"
                min="300"
                max="900"
                step="100"
                color="primary"
                thumb-label
                hide-details
              />

            </v-col>


            <!-- 기울기 -->

            <v-col
              cols="12"
              md="4"
            >

              <div
                class="d-flex justify-space-between text-subtitle-2 font-weight-bold"
              >

                <span>
                  기울기
                </span>

                <span class="text-primary">
                  {{ italic }}°
                </span>

              </div>

              <v-slider
                v-model="italic"
                min="0"
                max="20"
                step="1"
                color="primary"
                thumb-label
                hide-details
              />

            </v-col>


            <!-- 투명 배경 -->

            <v-col cols="12">

              <v-divider class="mb-4" />

              <div class="d-flex align-center">

                <div>

                  <div class="text-subtitle-2 font-weight-bold">
                    투명 배경
                  </div>

                  <div class="text-caption text-medium-emphasis">
                    서명만 포함된 PNG 이미지를 만들 수 있습니다.
                  </div>

                </div>

                <v-spacer />

                <v-switch
                  v-model="transparentBackground"
                  color="primary"
                  hide-details
                />

              </div>

            </v-col>

          </v-row>

        </v-card>


        <!-- 미리보기 -->

        <v-card
          elevation="1"
          rounded="xl"
          class="pa-5 pa-md-7 mb-6"
        >

          <div class="d-flex align-center mb-5">

            <v-icon
              icon="mdi-image-outline"
              color="primary"
              class="mr-2"
            />

            <h2 class="text-h6 font-weight-bold">
              사인 미리보기
            </h2>

          </div>


          <v-sheet
            rounded="lg"
            border
            class="overflow-hidden"
          >

            <v-responsive
              :aspect-ratio="1200 / 500"
              class="d-flex align-center justify-center"
              :class="
                transparentBackground
                  ? 'bg-grey-lighten-4'
                  : ''
              "
            >

              <canvas
                ref="canvasRef"
                :width="canvasWidth"
                :height="canvasHeight"
                class="w-100"
              />

            </v-responsive>

          </v-sheet>


          <v-divider class="my-6" />


          <div
            class="d-flex flex-column flex-sm-row ga-3"
          >

            <v-btn
              color="primary"
              size="large"
              variant="tonal"
              prepend-icon="mdi-refresh"
              class="flex-grow-1"
              @click="randomizeSignature"
            >
              다른 스타일 만들기
            </v-btn>

            <v-btn
              color="primary"
              size="large"
              prepend-icon="mdi-download"
              class="flex-grow-1"
              @click="downloadPng"
            >
              PNG 다운로드
            </v-btn>

          </div>

        </v-card>


        <!-- 현재 설정 -->

        <v-card
          elevation="1"
          rounded="xl"
          class="pa-5 pa-md-7 mb-6"
        >

          <div class="d-flex align-center mb-5">

            <v-icon
              icon="mdi-information-outline"
              color="primary"
              class="mr-2"
            />

            <h2 class="text-h6 font-weight-bold">
              현재 설정
            </h2>

          </div>


          <v-row>

            <v-col
              cols="6"
              md="3"
            >

              <div class="text-caption text-medium-emphasis">
                이름
              </div>

              <div class="font-weight-bold">
                {{ name || '-' }}
              </div>

            </v-col>


            <v-col
              cols="6"
              md="3"
            >

              <div class="text-caption text-medium-emphasis">
                스타일
              </div>

              <div class="font-weight-bold">
                {{ selectedStyle?.title }}
              </div>

            </v-col>


            <v-col
              cols="6"
              md="3"
            >

              <div class="text-caption text-medium-emphasis">
                글자 크기
              </div>

              <div class="font-weight-bold">
                {{ fontSize }}px
              </div>

            </v-col>


            <v-col
              cols="6"
              md="3"
            >

              <div class="text-caption text-medium-emphasis">
                배경
              </div>

              <div class="font-weight-bold">
                {{ transparentBackground ? '투명' : '흰색' }}
              </div>

            </v-col>

          </v-row>

        </v-card>


        <!-- 안내 -->

        <v-alert
          type="info"
          variant="tonal"
          rounded="lg"
          icon="mdi-information-outline"
        >

          <div class="font-weight-bold mb-1">
            사인 이미지 안내
          </div>

          <div>
            생성된 이미지는 PNG 형식으로 저장됩니다.
            투명 배경을 선택하면 문서나 이미지 위에 바로 사용할 수 있습니다.
          </div>

        </v-alert>

      </v-container>

    </v-main>
  </v-app>
</template>