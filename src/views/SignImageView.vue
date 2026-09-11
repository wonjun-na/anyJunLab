```vue
<template>
  <v-app>
    <v-main class="bg-grey-lighten-4">
      <v-container class="py-8">

        <!-- 제목 -->
        <div class="mb-6">
          <v-chip
            color="primary"
            variant="tonal"
            prepend-icon="mdi-draw-pen"
            class="mb-4"
          >
            서명 만들기
          </v-chip>

          <h1 class="text-h4 text-md-h3 font-weight-bold mb-3">
            온라인 사인 만들기
          </h1>

          <p class="text-body-1 text-grey-darken-1">
            마우스나 손가락으로 직접 서명을 그려보세요.
            실제 펜으로 쓰는 듯한 자연스러운 획을 표현합니다.
          </p>
        </div>

        <!-- 서명 작성 -->
        <v-card
          elevation="1"
          rounded="xl"
          class="pa-5 pa-md-7 mb-6"
        >
          <!-- 카드 제목 -->
          <div class="d-flex align-center mb-5">
            <v-icon
              icon="mdi-draw-pen"
              color="primary"
              size="28"
              class="mr-3"
            />

            <div>
              <div class="text-h6 font-weight-bold">
                서명 그리기
              </div>

              <div class="text-body-2 text-grey-darken-1">
                아래 영역에 자연스럽게 서명을 작성해주세요.
              </div>
            </div>
          </div>

          <!-- 설정 -->
          <v-row class="mb-2">

            <!-- 펜 굵기 -->
            <v-col
              cols="12"
              sm="6"
            >
              <div class="text-body-2 font-weight-medium mb-1">
                펜 굵기
              </div>

              <v-slider
                v-model="lineWidth"
                min="1"
                max="8"
                step="0.5"
                color="primary"
                thumb-label
                hide-details
              >
                <template #append>
                  <span class="text-body-2 text-grey-darken-1">
                    {{ lineWidth }}px
                  </span>
                </template>
              </v-slider>
            </v-col>

            <!-- 펜 색상 -->
            <v-col
              cols="12"
              sm="6"
            >
              <div class="text-body-2 font-weight-medium mb-2">
                펜 색상
              </div>

              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    variant="outlined"
                    rounded="lg"
                    height="40"
                    min-width="130"
                  >
                    <v-avatar
                      :color="lineColor"
                      size="18"
                      class="mr-2"
                    />

                    {{ lineColor }}
                  </v-btn>
                </template>

                <v-card rounded="lg">
                  <v-color-picker
                    v-model="lineColor"
                    mode="hex"
                    hide-inputs
                    show-swatches
                  />
                </v-card>
              </v-menu>
            </v-col>
          </v-row>

          <!-- 서명 영역 -->
          <v-card
            variant="outlined"
            rounded="lg"
            class="overflow-hidden bg-white mt-4"
          >
            <canvas
              ref="canvas"
              class="d-block w-100"
              @pointerdown="pointerDown"
              @pointermove="pointerMove"
              @pointerup="pointerUp"
              @pointercancel="pointerCancel"
            />
          </v-card>

          <!-- 안내 -->
          <v-alert
            type="info"
            variant="tonal"
            rounded="lg"
            icon="mdi-information-outline"
            class="mt-4"
          >
            마우스나 손가락으로 직접 그려주세요.
            천천히 그릴 때는 조금 두껍게, 빠르게 그릴 때는
            조금 가늘게 표현됩니다.
          </v-alert>

          <!-- 버튼 -->
          <div class="d-flex flex-wrap ga-3 mt-5">

            <v-btn
              color="grey-darken-1"
              variant="outlined"
              prepend-icon="mdi-undo"
              :disabled="history.length === 0"
              @click="undo"
            >
              실행 취소
            </v-btn>

            <v-btn
              color="error"
              variant="outlined"
              prepend-icon="mdi-eraser"
              :disabled="isEmpty"
              @click="clearCanvas"
            >
              전체 지우기
            </v-btn>

            <v-spacer />

            <v-btn
              color="primary"
              size="large"
              prepend-icon="mdi-download"
              :disabled="isEmpty"
              @click="downloadSignature"
            >
              PNG 저장
            </v-btn>

          </div>
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
              size="28"
              class="mr-3"
            />

            <div>
              <div class="text-h6 font-weight-bold">
                서명 미리보기
              </div>

              <div class="text-body-2 text-grey-darken-1">
                완성된 서명을 확인할 수 있습니다.
              </div>
            </div>
          </div>

          <v-card
            variant="outlined"
            rounded="lg"
            class="pa-4 bg-grey-lighten-4"
          >
            <div
              v-if="signatureImage"
              class="d-flex justify-center"
            >
              <img
                :src="signatureImage"
                alt="서명 미리보기"
                class="w-100"
              />
            </div>

            <div
              v-else
              class="text-center text-grey-darken-1 py-12"
            >
              <v-icon
                icon="mdi-draw-pen"
                size="48"
                class="mb-3"
              />

              <div class="text-body-1">
                아직 작성된 서명이 없습니다.
              </div>
            </div>
          </v-card>
        </v-card>

        <!-- 사용 방법 -->
        <v-card
          elevation="1"
          rounded="xl"
          class="pa-5 pa-md-7"
        >
          <div class="d-flex align-center mb-5">
            <v-icon
              icon="mdi-help-circle-outline"
              color="primary"
              size="28"
              class="mr-3"
            />

            <div class="text-h6 font-weight-bold">
              사용 방법
            </div>
          </div>

          <v-row>

            <v-col
              cols="12"
              md="4"
            >
              <v-card
                variant="tonal"
                color="primary"
                rounded="lg"
                class="pa-4 h-100"
              >
                <div class="d-flex align-center mb-3">
                  <v-avatar
                    color="primary"
                    size="36"
                    class="mr-3"
                  >
                    <span class="text-white font-weight-bold">
                      1
                    </span>
                  </v-avatar>

                  <span class="font-weight-bold">
                    서명 그리기
                  </span>
                </div>

                <div class="text-body-2">
                  서명 영역에서 마우스나 손가락으로
                  자연스럽게 서명을 작성합니다.
                </div>
              </v-card>
            </v-col>

            <v-col
              cols="12"
              md="4"
            >
              <v-card
                variant="tonal"
                color="primary"
                rounded="lg"
                class="pa-4 h-100"
              >
                <div class="d-flex align-center mb-3">
                  <v-avatar
                    color="primary"
                    size="36"
                    class="mr-3"
                  >
                    <span class="text-white font-weight-bold">
                      2
                    </span>
                  </v-avatar>

                  <span class="font-weight-bold">
                    펜 설정
                  </span>
                </div>

                <div class="text-body-2">
                  펜의 굵기와 색상을 원하는 스타일로
                  조절할 수 있습니다.
                </div>
              </v-card>
            </v-col>

            <v-col
              cols="12"
              md="4"
            >
              <v-card
                variant="tonal"
                color="primary"
                rounded="lg"
                class="pa-4 h-100"
              >
                <div class="d-flex align-center mb-3">
                  <v-avatar
                    color="primary"
                    size="36"
                    class="mr-3"
                  >
                    <span class="text-white font-weight-bold">
                      3
                    </span>
                  </v-avatar>

                  <span class="font-weight-bold">
                    PNG 저장
                  </span>
                </div>

                <div class="text-body-2">
                  완성된 서명을 PNG 이미지로 저장하여
                  문서나 이미지에 사용할 수 있습니다.
                </div>
              </v-card>
            </v-col>

          </v-row>
        </v-card>

      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import {
  ref,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch
} from 'vue'


/* =========================================================
 * 기본 설정
 * ======================================================= */

const canvas = ref(null)

const lineWidth = ref(4)
const lineColor = ref('#222222')

const isDrawing = ref(false)
const isEmpty = ref(true)

const signatureImage = ref('')

/*
 * Undo용 상태
 *
 * 한 번의 서명 획이 끝날 때마다
 * 캔버스 전체 이미지를 저장한다.
 */
const history = ref([])


/*
 * 실제 저장용 해상도
 *
 * 화면보다 크게 만들어서
 * PNG 저장 시 선명하게 만든다.
 */
const WIDTH = 1600
const HEIGHT = 600


let ctx = null

/*
 * 현재 그리고 있는 획
 */
let stroke = []

/*
 * 현재 Pointer ID
 */
let activePointerId = null


/* =========================================================
 * Canvas 초기화
 * ======================================================= */

const initCanvas = async () => {
  await nextTick()

  if (!canvas.value) {
    return
  }

  /*
   * 실제 캔버스 해상도
   */
  canvas.value.width = WIDTH
  canvas.value.height = HEIGHT

  ctx = canvas.value.getContext('2d', {
    alpha: true
  })

  /*
   * 기본 펜 설정
   */
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.imageSmoothingEnabled = true

  clearCanvas(false)

  window.addEventListener(
    'resize',
    updatePreview
  )
}


/* =========================================================
 * 좌표 변환
 * ======================================================= */

const getPoint = (event) => {
  const rect =
    canvas.value.getBoundingClientRect()

  const scaleX =
    WIDTH / rect.width

  const scaleY =
    HEIGHT / rect.height

  return {
    x:
      (event.clientX - rect.left) *
      scaleX,

    y:
      (event.clientY - rect.top) *
      scaleY,

    time:
      performance.now(),

    pressure:
      event.pressure > 0
        ? event.pressure
        : 0.5
  }
}


/* =========================================================
 * Pointer 시작
 * ======================================================= */

const pointerDown = (event) => {
  if (!ctx) {
    return
  }

  event.preventDefault()

  activePointerId =
    event.pointerId

  try {
    canvas.value.setPointerCapture(
      event.pointerId
    )
  } catch {
    // 무시
  }

  isDrawing.value = true
  isEmpty.value = false

  stroke = []

  const point =
    getPoint(event)

  stroke.push(point)

  /*
   * 시작점
   *
   * 실제 펜을 종이에 대는 느낌을 위해
   * 작은 원으로 시작한다.
   */
  ctx.beginPath()

  ctx.fillStyle =
    lineColor.value

  ctx.arc(
    point.x,
    point.y,
    Math.max(
      0.8,
      lineWidth.value * 0.32
    ),
    0,
    Math.PI * 2
  )

  ctx.fill()
}


/* =========================================================
 * Pointer 이동
 * ======================================================= */

const pointerMove = (event) => {
  if (
    !isDrawing.value ||
    event.pointerId !== activePointerId
  ) {
    return
  }

  event.preventDefault()

  const point =
    getPoint(event)

  const previous =
    stroke[stroke.length - 1]

  /*
   * 너무 가까운 좌표는 무시한다.
   *
   * 마우스 떨림을 줄이는 역할.
   */
  const distance =
    Math.hypot(
      point.x - previous.x,
      point.y - previous.y
    )

  if (distance < 1.2) {
    return
  }

  stroke.push(point)

  /*
   * 최근 획을 부드럽게 렌더링
   */
  renderLatestSegment()
}


/* =========================================================
 * 부드러운 획 렌더링
 *
 * 핵심 부분
 * ======================================================= */

const renderLatestSegment = () => {
  const count =
    stroke.length

  if (count < 2) {
    return
  }

  /*
   * 최소 4개의 점을 이용한다.
   */
  const p0 =
    stroke[Math.max(0, count - 4)]

  const p1 =
    stroke[Math.max(0, count - 3)]

  const p2 =
    stroke[Math.max(0, count - 2)]

  const p3 =
    stroke[Math.max(0, count - 1)]


  /*
   * Catmull-Rom → Bezier
   *
   * 마우스 좌표를 그대로 연결하지 않고
   * 주변 좌표를 이용해 곡선을 만든다.
   */
  const cp1 = {
    x:
      p1.x +
      (p2.x - p0.x) / 6,

    y:
      p1.y +
      (p2.y - p0.y) / 6
  }

  const cp2 = {
    x:
      p2.x -
      (p3.x - p1.x) / 6,

    y:
      p2.y -
      (p3.y - p1.y) / 6
  }


  /*
   * 속도 계산
   */
  const distance =
    Math.hypot(
      p2.x - p1.x,
      p2.y - p1.y
    )

  const time =
    Math.max(
      1,
      p2.time - p1.time
    )

  const speed =
    distance / time


  /*
   * 압력 계산
   *
   * 느림  → 두꺼움
   * 빠름  → 얇음
   */
  let pressure =
    1.15 -
    speed * 0.08


  pressure =
    Math.max(
      0.38,
      Math.min(
        1.2,
        pressure
      )
    )


  /*
   * 실제 펜 두께
   *
   * Pointer 압력도 지원
   */
  const pointerPressure =
    p2.pressure || 0.5

  const pressureMix =
    0.75 +
    pointerPressure * 0.5

  const width =
    lineWidth.value *
    pressure *
    pressureMix


  /*
   * 곡선을 여러 조각으로 나누어
   * 굵기 변화를 자연스럽게 만든다.
   */
  const STEPS = 12

  let previousX =
    p1.x

  let previousY =
    p1.y

  for (
    let i = 1;
    i <= STEPS;
    i++
  ) {
    const t =
      i / STEPS

    const mt =
      1 - t

    /*
     * Cubic Bezier
     */
    const x =
      mt * mt * mt * p1.x +
      3 *
        mt *
        mt *
        t *
        cp1.x +
      3 *
        mt *
        t *
        t *
        cp2.x +
      t *
        t *
        t *
        p2.x

    const y =
      mt * mt * mt * p1.y +
      3 *
        mt *
        mt *
        t *
        cp1.y +
      3 *
        mt *
        t *
        t *
        cp2.y +
      t *
        t *
        t *
        p2.y


    /*
     * 획 중앙은 살짝 두껍게,
     * 연결 부분은 자연스럽게.
     */
    const thickness =
      width *
      (
        0.90 +
        Math.sin(
          t * Math.PI
        ) * 0.10
      )


    drawLine(
      previousX,
      previousY,
      x,
      y,
      thickness
    )

    previousX = x
    previousY = y
  }
}


/* =========================================================
 * 아주 짧은 선 하나
 * ======================================================= */

const drawLine = (
  x1,
  y1,
  x2,
  y2,
  width
) => {
  const distance =
    Math.hypot(
      x2 - x1,
      y2 - y1
    )

  if (distance <= 0) {
    return
  }

  ctx.beginPath()

  ctx.strokeStyle =
    lineColor.value

  ctx.lineWidth =
    Math.max(
      0.7,
      width
    )

  ctx.lineCap =
    'round'

  ctx.lineJoin =
    'round'

  ctx.moveTo(
    x1,
    y1
  )

  ctx.lineTo(
    x2,
    y2
  )

  ctx.stroke()
}


/* =========================================================
 * Pointer 종료
 * ======================================================= */

const pointerUp = (event) => {
  if (
    !isDrawing.value ||
    event.pointerId !== activePointerId
  ) {
    return
  }

  event.preventDefault()

  finishStroke(event)

}


/* =========================================================
 * Pointer 취소
 * ======================================================= */

const pointerCancel = (event) => {
  if (
    event.pointerId !== activePointerId
  ) {
    return
  }

  finishStroke(event)
}


/* =========================================================
 * 획 종료
 * ======================================================= */

const finishStroke = (event) => {
  isDrawing.value = false

  try {
    canvas.value.releasePointerCapture(
      event.pointerId
    )
  } catch {
    // 무시
  }

  /*
   * 마지막 부분을 자연스럽게 마무리
   */
  finishStrokeCap()

  /*
   * Undo 저장
   */
  saveHistory()

  /*
   * 미리보기
   */
  updatePreview()

  stroke = []

  activePointerId = null
}


/* =========================================================
 * 획 끝부분
 * ======================================================= */

const finishStrokeCap = () => {
  if (stroke.length < 2) {
    return
  }

  const last =
    stroke[
      stroke.length - 1
    ]

  const previous =
    stroke[
      stroke.length - 2
    ]

  const angle =
    Math.atan2(
      last.y - previous.y,
      last.x - previous.x
    )

  /*
   * 끝으로 갈수록 얇아진다.
   */
  const length = 10

  const steps = 8

  let x1 =
    last.x

  let y1 =
    last.y

  for (
    let i = 1;
    i <= steps;
    i++
  ) {
    const t =
      i / steps

    const distance =
      length * t

    const x =
      last.x +
      Math.cos(angle) *
      distance

    const y =
      last.y +
      Math.sin(angle) *
      distance

    const width =
      lineWidth.value *
      (
        0.35 -
        0.30 * t
      )

    drawLine(
      x1,
      y1,
      x,
      y,
      width
    )

    x1 = x
    y1 = y
  }
}


/* =========================================================
 * Undo 저장
 * ======================================================= */

const saveHistory = () => {
  if (!canvas.value) {
    return
  }

  const image =
    canvas.value.toDataURL(
      'image/png'
    )

  history.value.push(image)

  /*
   * 최대 30단계
   */
  if (
    history.value.length > 30
  ) {
    history.value.shift()
  }
}


/* =========================================================
 * Undo
 * ======================================================= */

const undo = () => {
  if (
    !ctx ||
    history.value.length === 0
  ) {
    return
  }

  /*
   * 마지막 상태 제거
   */
  history.value.pop()

  /*
   * 이전 상태가 없으면
   * 빈 캔버스로 돌아간다.
   */
  if (
    history.value.length === 0
  ) {
    ctx.clearRect(
      0,
      0,
      WIDTH,
      HEIGHT
    )

    isEmpty.value = true
    signatureImage.value = ''

    return
  }

  const previous =
    history.value[
      history.value.length - 1
    ]

  const image =
    new Image()

  image.onload = () => {
    ctx.clearRect(
      0,
      0,
      WIDTH,
      HEIGHT
    )

    ctx.drawImage(
      image,
      0,
      0,
      WIDTH,
      HEIGHT
    )

    isEmpty.value = false

    updatePreview()
  }

  image.src = previous
}


/* =========================================================
 * 전체 지우기
 *
 * 현재 서명은 Undo 가능하도록
 * 지우기 직전 상태를 history에 저장한다.
 * ======================================================= */

const clearCanvas = () => {
  if (
    !ctx ||
    isEmpty.value
  ) {
    return
  }

  /*
   * 현재 서명 저장
   */
  saveHistory()

  /*
   * 화면 삭제
   */
  ctx.clearRect(
    0,
    0,
    WIDTH,
    HEIGHT
  )

  isEmpty.value = true

  signatureImage.value = ''
}


/* =========================================================
 * 미리보기
 * ======================================================= */

const updatePreview = () => {
  if (!canvas.value) {
    return
  }

  signatureImage.value =
    canvas.value.toDataURL(
      'image/png'
    )
}


/* =========================================================
 * PNG 저장
 * ======================================================= */

const downloadSignature = () => {
  if (
    !canvas.value ||
    isEmpty.value
  ) {
    return
  }

  /*
   * 투명 PNG
   */
  const image =
    canvas.value.toDataURL(
      'image/png'
    )

  const link =
    document.createElement('a')

  link.download =
    'my-signature.png'

  link.href =
    image

  document.body.appendChild(
    link
  )

  link.click()

  document.body.removeChild(
    link
  )
}


/* =========================================================
 * 펜 색상 변경
 * ======================================================= */

watch(
  lineColor,
  () => {
    if (!ctx) {
      return
    }

    ctx.strokeStyle =
      lineColor.value
  }
)


/* =========================================================
 * 시작
 * ======================================================= */

onMounted(() => {
  initCanvas()
})


/* =========================================================
 * 종료
 * ======================================================= */

onBeforeUnmount(() => {
  window.removeEventListener(
    'resize',
    updatePreview
  )
})
</script>
```
