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
                아래 영역에 손가락이나 마우스로 서명을 작성해주세요.
              </div>
            </div>
          </div>

          <!-- 설정 -->
          <v-row class="mb-2">

            <v-col
              cols="12"
              sm="6"
            >
              <div class="text-body-2 font-weight-medium mb-1">
                펜 굵기
              </div>

              <v-slider
                v-model="lineWidth"
                min="2"
                max="12"
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

          <!-- Canvas -->
          <v-card
            variant="outlined"
            rounded="lg"
            class="overflow-hidden bg-white mt-4"
            style="touch-action: none; user-select: none; -webkit-user-select: none;"
          >
            <canvas
              ref="canvas"
              class="d-block w-100"
              @pointerdown.prevent="pointerDown"
              @pointermove.prevent="pointerMove"
              @pointerup.prevent="pointerUp"
              @pointercancel.prevent="pointerCancel"
            />
          </v-card>

          <v-alert
            type="info"
            variant="tonal"
            rounded="lg"
            icon="mdi-information-outline"
            class="mt-4"
          >
            손가락으로 서명 영역을 그리는 동안에는 페이지가 스크롤되지 않습니다.
          </v-alert>

          <!-- 버튼 -->
          <div class="d-flex flex-wrap ga-3 mt-5">

            <v-btn
              color="grey-darken-1"
              variant="outlined"
              prepend-icon="mdi-undo"
              :disabled="history.length <= 1"
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
                  서명 영역에서 손가락이나 마우스로 직접 서명을 작성합니다.
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
                  펜 굵기와 색상을 원하는 스타일로 조절할 수 있습니다.
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
                  완성된 서명을 투명 PNG로 저장합니다.
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
  nextTick
} from 'vue'


/* =========================================================
 * 기본 설정
 * ======================================================= */

const canvas = ref(null)

const lineWidth = ref(6)

const lineColor = ref('#222222')

const isDrawing = ref(false)

const isEmpty = ref(true)

const signatureImage = ref('')

/*
 * 초기 빈 상태부터 저장
 *
 * history[0] = 빈 캔버스
 * history[1] = 첫 번째 획
 * history[2] = 두 번째 획
 * ...
 */
const history = ref([])


const WIDTH = 1600
const HEIGHT = 600

let ctx = null

let stroke = []

let activePointerId = null


/* =========================================================
 * Canvas 초기화
 * ======================================================= */

const initCanvas = async () => {

  await nextTick()

  if (!canvas.value) {
    return
  }

  canvas.value.width = WIDTH
  canvas.value.height = HEIGHT

  ctx =
    canvas.value.getContext(
      '2d',
      {
        alpha: true
      }
    )

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.imageSmoothingEnabled = true

  ctx.clearRect(
    0,
    0,
    WIDTH,
    HEIGHT
  )

  /*
   * 최초 상태
   */
  history.value = [
    canvas.value.toDataURL('image/png')
  ]

  updatePreview()

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
 * 그리기 시작
 * ======================================================= */

const pointerDown = (event) => {

  if (!ctx) {
    return
  }

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
   * 이전 코드보다 크게 시작
   */
  ctx.beginPath()

  ctx.fillStyle =
    lineColor.value

  ctx.arc(
    point.x,
    point.y,
    Math.max(
      1.2,
      lineWidth.value * 0.48
    ),
    0,
    Math.PI * 2
  )

  ctx.fill()
}


/* =========================================================
 * 그리는 중
 * ======================================================= */

const pointerMove = (event) => {

  if (
    !isDrawing.value ||
    event.pointerId !== activePointerId
  ) {
    return
  }

  const point =
    getPoint(event)

  const previous =
    stroke[
      stroke.length - 1
    ]

  if (!previous) {
    stroke.push(point)
    return
  }

  const distance =
    Math.hypot(
      point.x - previous.x,
      point.y - previous.y
    )

  /*
   * 너무 작은 움직임만 제거
   */
  if (distance < 0.5) {
    return
  }

  stroke.push(point)

  renderLatestSegment()
}


/* =========================================================
 * 부드러운 곡선 렌더링
 * ======================================================= */

const renderLatestSegment = () => {

  const count =
    stroke.length

  if (count < 2) {
    return
  }

  const p0 =
    stroke[
      Math.max(
        0,
        count - 4
      )
    ]

  const p1 =
    stroke[
      Math.max(
        0,
        count - 3
      )
    ]

  const p2 =
    stroke[
      Math.max(
        0,
        count - 2
      )
    ]

  const p3 =
    stroke[
      Math.max(
        0,
        count - 1
      )
    ]


  /*
   * Catmull-Rom → Bezier
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
   * 속도
   */
  const distance =
    Math.hypot(
      p2.x - p1.x,
      p2.y - p1.y
    )

  const elapsed =
    Math.max(
      1,
      p2.time - p1.time
    )

  const speed =
    distance / elapsed


  /*
   * 이전 코드보다 속도에 따른
   * 굵기 변화 폭을 크게 줄였다.
   *
   * 빠르게 써도 너무 얇아지지 않는다.
   */
  let speedFactor =
    1.05 -
    speed * 0.025

  speedFactor =
    Math.max(
      0.72,
      Math.min(
        1.12,
        speedFactor
      )
    )


  /*
   * 필압
   *
   * 손가락/마우스는 기본적으로 0.5
   */
  const realPressure =
    p2.pressure || 0.5


  const pressureFactor =
    0.88 +
    realPressure * 0.24


  /*
   * 최종 굵기
   *
   * 기존보다 확실히 두껍게
   */
  const width =
    lineWidth.value *
    speedFactor *
    pressureFactor


  const STEPS = 14

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
     * 가운데가 살짝 두껍고
     * 양쪽이 자연스럽게 연결
     */
    const thickness =
      width *
      (
        0.97 +
        Math.sin(
          t * Math.PI
        ) *
        0.05
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
 * 선 렌더링
 * ======================================================= */

const drawLine = (
  x1,
  y1,
  x2,
  y2,
  width
) => {

  if (
    x1 === x2 &&
    y1 === y2
  ) {
    return
  }

  ctx.beginPath()

  ctx.strokeStyle =
    lineColor.value

  ctx.lineWidth =
    Math.max(
      1.5,
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
 *
 * ★ 여기서 더 이상 추가 선을 그리지 않는다.
 * ======================================================= */

const pointerUp = (event) => {

  if (
    event.pointerId !== activePointerId
  ) {
    return
  }

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

  if (!isDrawing.value) {
    return
  }

  isDrawing.value = false

  try {
    canvas.value.releasePointerCapture(
      event.pointerId
    )
  } catch {
    // 무시
  }

  /*
   * ★ 중요
   *
   * 기존의 finishStrokeCap() 제거
   *
   * 손을 뗐을 때 추가로 선을 그리지 않는다.
   */


  /*
   * 현재 상태를 History에 저장
   */
  saveHistory()

  updatePreview()

  stroke = []

  activePointerId = null
}


/* =========================================================
 * History 저장
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
    history.value.length > 31
  ) {
    history.value.splice(
      1,
      1
    )
  }
}


/* =========================================================
 * Undo
 *
 * 마지막 상태를 제거하고
 * 그 전 상태를 복구한다.
 * ======================================================= */

const undo = () => {

  if (
    !ctx ||
    history.value.length <= 1
  ) {
    return
  }

  /*
   * 현재 상태 제거
   */
  history.value.pop()

  const previous =
    history.value[
      history.value.length - 1
    ]

  restoreImage(previous)
}


/* =========================================================
 * 이미지 복구
 * ======================================================= */

const restoreImage = (src) => {

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

    /*
     * 최초 빈 상태인지 확인
     */
    isEmpty.value =
      history.value.length <= 1

    if (isEmpty.value) {
      signatureImage.value = ''
    } else {
      updatePreview()
    }
  }

  image.src = src
}


/* =========================================================
 * 전체 지우기
 * ======================================================= */

const clearCanvas = () => {

  if (
    !ctx ||
    isEmpty.value
  ) {
    return
  }

  /*
   * 화면을 먼저 지운다.
   */
  ctx.clearRect(
    0,
    0,
    WIDTH,
    HEIGHT
  )

  isEmpty.value = true

  signatureImage.value = ''

  /*
   * ★ 빈 상태를 History에 추가
   *
   * 이렇게 해야
   *
   * 서명
   * ↓
   * 전체 지우기
   * ↓
   * Undo
   *
   * 했을 때 서명이 복구된다.
   */
  saveHistory()
}


/* =========================================================
 * Preview
 * ======================================================= */

const updatePreview = () => {

  if (!canvas.value) {
    return
  }

  if (isEmpty.value) {
    signatureImage.value = ''
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
