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

          <!-- 제목 -->
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

            <!-- 굵기 -->
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

            <!-- 색상 -->
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

          <!--
            ★ 중요 ★

            touch-action: none

            이 영역에서 브라우저에게
            "터치 동작을 스크롤로 사용하지 마라"
            라고 알려준다.

            별도의 <style> 태그는 사용하지 않는다.
          -->
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
              @pointerleave="pointerLeave"
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
            손가락으로 서명 영역을 그리는 동안에는 페이지가 스크롤되지 않습니다.
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
                  서명 영역에서 손가락이나 마우스로
                  직접 서명을 작성합니다.
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
                  펜 굵기와 색상을 원하는 스타일로
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
  nextTick,
  watch
} from 'vue'


/* =========================================================
 * 기본값
 * ======================================================= */

const canvas = ref(null)

const lineWidth = ref(4)

const lineColor = ref('#222222')

const isDrawing = ref(false)

const isEmpty = ref(true)

const signatureImage = ref('')


/*
 * Undo history
 *
 * 각각의 완료된 상태를 저장한다.
 */
const history = ref([])


/*
 * Canvas 실제 해상도
 */
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

  /*
   * 빈 상태에서는 history에 저장하지 않는다.
   */
  ctx.clearRect(
    0,
    0,
    WIDTH,
    HEIGHT
  )

  updatePreview()

  window.addEventListener(
    'resize',
    updatePreview
  )
}


/* =========================================================
 * 좌표 계산
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

    /*
     * 스타일러스는 실제 pressure 사용
     *
     * 손가락 / 마우스는 0.5 정도를 사용
     */
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

  /*
   * 브라우저가 이 포인터를 계속
   * Canvas에서 추적하도록 한다.
   */
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
   */
  ctx.beginPath()

  ctx.fillStyle =
    lineColor.value

  ctx.arc(
    point.x,
    point.y,
    Math.max(
      0.8,
      lineWidth.value * 0.35
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
   * 너무 작은 움직임은 무시
   */
  if (distance < 0.8) {
    return
  }


  stroke.push(point)


  /*
   * 최근 구간 렌더링
   */
  renderLatestSegment()
}


/* =========================================================
 * 자연스러운 곡선
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
   * Catmull-Rom 방식으로
   * 부드러운 Bezier control point 생성
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
   * 이동 속도
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
   * 속도가 빠르면 얇게
   * 속도가 느리면 두껍게
   */
  let speedPressure =
    1.15 -
    speed * 0.08


  speedPressure =
    Math.max(
      0.38,
      Math.min(
        1.2,
        speedPressure
      )
    )


  /*
   * 실제 스타일러스 필압
   */
  const realPressure =
    p2.pressure || 0.5


  const pressure =
    speedPressure *
    (
      0.75 +
      realPressure * 0.5
    )


  const width =
    lineWidth.value *
    pressure


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


    const thickness =
      width *
      (
        0.92 +
        Math.sin(
          t * Math.PI
        ) *
        0.08
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
 * 선 하나 렌더링
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
    event.pointerId !==
    activePointerId
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
    event.pointerId !==
    activePointerId
  ) {
    return
  }

  finishStroke(event)
}


/* =========================================================
 * Pointer가 영역 밖으로 나간 경우
 *
 * setPointerCapture가 잡혀있기 때문에
 * 실제 손가락이 영역 밖으로 나가도 계속 추적된다.
 * ======================================================= */

const pointerLeave = () => {

  /*
   * 아무것도 하지 않는다.
   *
   * 여기서 stroke를 종료하면
   * 손가락으로 크게 움직일 때
   * 획이 끊어질 수 있다.
   */
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
   * 마지막 획 처리
   */
  finishStrokeCap()


  /*
   * 현재 상태 저장
   */
  saveHistory()


  /*
   * 미리보기 갱신
   */
  updatePreview()


  stroke = []

  activePointerId = null
}


/* =========================================================
 * 마지막 부분 자연스럽게 처리
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
 * History
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
   * 현재 상태 제거
   */
  history.value.pop()


  /*
   * 이전 상태가 없으면
   * 완전히 빈 상태
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
 * 지우기 직전 상태를 저장하므로
 * Undo로 복구 가능
 * ======================================================= */

const clearCanvas = () => {

  if (
    !ctx ||
    isEmpty.value
  ) {
    return
  }


  /*
   * 현재 상태 저장
   */
  saveHistory()


  /*
   * 전체 삭제
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
 * 색상 변경
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
