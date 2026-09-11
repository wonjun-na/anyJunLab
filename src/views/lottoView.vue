<template>
  <v-app>
    <v-main class="bg-grey-lighten-4">
      <v-container class="py-8">

        <!-- 제목 -->
        <div class="mb-6">
          <v-chip
            color="primary"
            variant="tonal"
            prepend-icon="mdi-ticket-confirmation-outline"
            class="mb-4"
          >
            로또 계산기
          </v-chip>

          <h1 class="text-h4 text-md-h3 font-weight-bold mb-3">
            로또 추첨기
          </h1>

          <p class="text-body-1 text-grey-darken-1">
            1부터 45까지의 번호 중 6개의 번호와 보너스 번호를
            무작위로 추첨합니다. 최대 5게임까지 동시에 추첨할 수 있습니다.
          </p>
        </div>


        <!-- 게임 수 선택 -->
        <v-card
          elevation="1"
          rounded="xl"
          class="pa-5 pa-md-7 mb-6"
        >

          <div class="d-flex align-center mb-5">
            <v-icon
              icon="mdi-cards-outline"
              color="primary"
              size="28"
              class="mr-3"
            />

            <div>
              <div class="text-h6 font-weight-bold">
                게임 수 선택
              </div>

              <div class="text-body-2 text-grey-darken-1">
                동시에 추첨할 게임 수를 선택하세요. (최대 5게임)
              </div>
            </div>
          </div>

          <v-btn-toggle
            v-model="gameCount"
            color="primary"
            variant="outlined"
            mandatory
            divided
            :disabled="isDrawing"
          >
            <v-btn
              v-for="n in MAX_GAMES"
              :key="`count-${n}`"
              :value="n"
              min-width="64"
            >
              {{ n }}게임
            </v-btn>
          </v-btn-toggle>

        </v-card>


        <!-- 추첨기 -->
        <v-card
          elevation="1"
          rounded="xl"
          class="pa-5 pa-md-7 mb-6"
        >

          <!-- 카드 제목 -->
          <div class="d-flex align-center mb-6">
            <v-icon
              icon="mdi-dice-multiple-outline"
              color="primary"
              size="28"
              class="mr-3"
            />

            <div>
              <div class="text-h6 font-weight-bold">
                번호 추첨
              </div>

              <div class="text-body-2 text-grey-darken-1">
                버튼을 누르면 모든 게임이 동시에, 번호 순서대로 추첨됩니다.
              </div>
            </div>
          </div>


          <!-- 진행 상태 -->
          <v-card
            variant="tonal"
            color="primary"
            rounded="xl"
            class="pa-4 pa-md-6 mb-6 text-center"
          >
            <div class="text-body-2 mb-1">
              {{ drawingText }}
            </div>

            <v-progress-linear
              v-if="isDrawing"
              :model-value="(currentRound / TOTAL_ROUNDS) * 100"
              color="primary"
              height="6"
              rounded
              class="mt-2"
            />
          </v-card>


          <!-- 게임별 결과 -->
          <v-card
            v-for="game in displayGames"
            :key="`game-${game.label}`"
            variant="outlined"
            rounded="lg"
            class="pa-4 mb-3"
          >

            <div class="d-flex align-center mb-3 ga-2">
              <v-avatar
                size="28"
                color="primary"
              >
                <span class="text-white text-body-2 font-weight-bold">
                  {{ game.label }}
                </span>
              </v-avatar>

              <span class="text-body-2 text-grey-darken-1">
                게임
              </span>
            </div>

            <div class="d-flex flex-wrap align-center ga-3">

              <!-- 번호 6개 슬롯 -->
              <v-avatar
                v-for="(slot, index) in game.slots.slice(0, 6)"
                :key="`slot-${game.label}-${index}`"
                size="48"
                :color="ballColor(slot)"
                elevation="2"
                :class="slot.spinning ? 'ball-spinning' : ''"
              >
                <span
                  class="text-body-1 font-weight-bold"
                  :class="slot.value === null && !slot.spinning ? 'text-grey-darken-1' : 'text-white'"
                >
                  {{ slot.value ?? '?' }}
                </span>
              </v-avatar>

              <v-icon
                icon="mdi-plus"
                color="grey"
                class="mx-1"
              />

              <!-- 보너스 슬롯 -->
              <v-avatar
                size="48"
                :color="ballColor(game.slots[6])"
                elevation="2"
                :class="game.slots[6].spinning ? 'ball-spinning' : ''"
              >
                <span
                  class="text-body-1 font-weight-bold"
                  :class="game.slots[6].value === null && !game.slots[6].spinning ? 'text-grey-darken-1' : 'text-white'"
                >
                  {{ game.slots[6].value ?? '?' }}
                </span>
              </v-avatar>

            </div>

          </v-card>


          <!-- 추첨 버튼 -->
          <div class="d-flex justify-center flex-wrap ga-3 mt-5">

            <v-btn
              color="primary"
              size="large"
              min-width="180"
              prepend-icon="mdi-play-circle-outline"
              :loading="isDrawing"
              :disabled="isDrawing"
              @click="startDrawing"
            >
              {{ completed ? '다시 추첨' : `${gameCount}게임 동시 추첨 시작` }}
            </v-btn>

            <v-btn
              variant="outlined"
              color="grey-darken-1"
              size="large"
              prepend-icon="mdi-refresh"
              :disabled="isDrawing"
              @click="reset"
            >
              초기화
            </v-btn>

          </div>

        </v-card>


        <!-- 번호 전체 보기 -->
        <v-card
          elevation="1"
          rounded="xl"
          class="pa-5 pa-md-7 mb-6"
        >

          <div class="d-flex align-center mb-5">
            <v-icon
              icon="mdi-format-list-numbered"
              color="primary"
              size="28"
              class="mr-3"
            />

            <div>
              <div class="text-h6 font-weight-bold">
                번호 목록
              </div>

              <div class="text-body-2 text-grey-darken-1">
                1부터 45까지의 전체 번호입니다. 확정된 번호가 강조 표시됩니다.
              </div>
            </div>
          </div>


          <div
            class="d-flex flex-wrap justify-center ga-2"
          >

            <v-avatar
              v-for="number in 45"
              :key="number"
              size="42"
              :color="isSelected(number)
                ? getBallColor(number)
                : 'grey-lighten-3'"
            >
              <span
                class="text-body-2 font-weight-bold"
                :class="isSelected(number)
                  ? 'text-white'
                  : 'text-grey-darken-2'"
              >
                {{ number }}
              </span>
            </v-avatar>

          </div>

        </v-card>


        <!-- 추첨 결과 -->
        <v-card
          elevation="1"
          rounded="xl"
          class="pa-5 pa-md-7 mb-6"
        >

          <div class="d-flex align-center mb-5">
            <v-icon
              icon="mdi-chart-box-outline"
              color="primary"
              size="28"
              class="mr-3"
            />

            <div>
              <div class="text-h6 font-weight-bold">
                추첨 결과
              </div>

              <div class="text-body-2 text-grey-darken-1">
                현재 추첨된 번호를 확인할 수 있습니다.
              </div>
            </div>
          </div>


          <v-row>

            <v-col
              cols="12"
              sm="4"
            >
              <v-card
                variant="tonal"
                color="primary"
                rounded="lg"
                class="pa-5 text-center h-100"
              >
                <v-icon
                  icon="mdi-cards-outline"
                  size="36"
                  class="mb-2"
                />

                <div class="text-body-2 mb-1">
                  동시 추첨 게임 수
                </div>

                <div class="text-h5 font-weight-bold">
                  {{ gameCount }}게임
                </div>
              </v-card>
            </v-col>


            <v-col
              cols="12"
              sm="4"
            >
              <v-card
                variant="tonal"
                color="success"
                rounded="lg"
                class="pa-5 text-center h-100"
              >
                <v-icon
                  icon="mdi-numeric-6-circle-outline"
                  size="36"
                  class="mb-2"
                />

                <div class="text-body-2 mb-1">
                  게임당 당첨 번호
                </div>

                <div class="text-h5 font-weight-bold">
                  6개 + 보너스 1개
                </div>
              </v-card>
            </v-col>


            <v-col
              cols="12"
              sm="4"
            >
              <v-card
                variant="tonal"
                color="warning"
                rounded="lg"
                class="pa-5 text-center h-100"
              >
                <v-icon
                  icon="mdi-counter"
                  size="36"
                  class="mb-2"
                />

                <div class="text-body-2 mb-1">
                  총 추첨 번호
                </div>

                <div class="text-h5 font-weight-bold">
                  {{ completed ? gameCount * 7 : 0 }}개
                </div>
              </v-card>
            </v-col>

          </v-row>

        </v-card>


        <!-- 안내 -->
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
              이용 안내
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
                    게임 수 선택
                  </span>
                </div>

                <div class="text-body-2">
                  1게임부터 5게임까지, 동시에 추첨할 게임 수를
                  선택할 수 있습니다.
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
                    동시 추첨
                  </span>
                </div>

                <div class="text-body-2">
                  모든 게임이 1번째 번호부터 함께 추첨되고,
                  뽑힌 즉시 해당 자리에 공이 표시됩니다.
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
                    다시 추첨
                  </span>
                </div>

                <div class="text-body-2">
                  다시 추첨 버튼을 누르면 이전 결과를
                  지우고 새로운 번호를 추첨합니다.
                </div>

              </v-card>
            </v-col>

          </v-row>


          <v-alert
            type="success"
            variant="tonal"
            rounded="lg"
            class="mt-5"
          >
            각 게임은 1부터 45까지의 번호 중 서로 독립적으로 추첨되며,
            모든 게임의 같은 순번(예: 1번째 번호)이 동시에 뽑힙니다.
          </v-alert>

        </v-card>

      </v-container>
    </v-main>
  </v-app>
</template>


<script setup>

import {
  ref,
  computed,
  onBeforeUnmount
} from 'vue'


/* =========================================================
 * 상수
 * ======================================================= */

const MAX_GAMES = 5

const GAME_LABELS = ['A', 'B', 'C', 'D', 'E']

// 게임당 뽑는 번호 개수 (번호 6개 + 보너스 1개)
const TOTAL_ROUNDS = 7


/* =========================================================
 * 상태
 * ======================================================= */

// 선택한 게임 수 (1~5)
const gameCount = ref(1)

// 실제 추첨 결과가 담기는 게임 배열
// game: { label, selected: number[7](내부 정답), slots: [{ value, spinning }] }
const games = ref([])

const isDrawing = ref(false)

const completed = ref(false)

// 현재 진행 중인 라운드 (1~7). 0이면 시작 전.
const currentRound = ref(0)

const timerIds = []


/* =========================================================
 * 화면에 표시할 게임 목록
 *
 * 아직 추첨을 시작하지 않았다면, 선택한 게임 수만큼
 * 빈 슬롯 placeholder를 보여준다.
 * ======================================================= */

const displayGames = computed(() => {

  if (games.value.length > 0) {
    return games.value
  }

  return Array.from(
    { length: gameCount.value },
    (_, i) => ({
      label: GAME_LABELS[i],
      slots: createEmptySlots()
    })
  )
})


/* =========================================================
 * 진행 문구
 * ======================================================= */

const drawingText = computed(() => {

  if (isDrawing.value) {

    if (currentRound.value <= 6) {
      return `${currentRound.value}번째 번호 동시 추첨 중 (${gameCount.value}게임)`
    }

    return `보너스 번호 동시 추첨 중 (${gameCount.value}게임)`
  }

  if (completed.value) {
    return '추첨 완료'
  }

  return '행운의 번호를 추첨해보세요'
})


/* =========================================================
 * 빈 슬롯(7개) 생성
 * ======================================================= */

const createEmptySlots = () => {

  return Array.from(
    { length: TOTAL_ROUNDS },
    () => ({
      value: null,
      spinning: false
    })
  )
}


/* =========================================================
 * 번호 색상
 *
 * 실제 로또 공과 비슷하게
 * 구간별 색상을 사용한다.
 * ======================================================= */

const getBallColor = (number) => {

  if (number >= 1 && number <= 10) {
    return 'amber-darken-2'
  }

  if (number >= 11 && number <= 20) {
    return 'blue'
  }

  if (number >= 21 && number <= 30) {
    return 'red'
  }

  if (number >= 31 && number <= 40) {
    return 'grey-darken-1'
  }

  return 'green'
}


/* =========================================================
 * 슬롯 상태에 따른 공 색상
 *
 * - 아직 값이 없으면 회색
 * - 추첨(스핀) 중이면 연한 색
 * - 확정되면 번호 구간별 색상
 * ======================================================= */

const ballColor = (slot) => {

  if (slot.value === null && !slot.spinning) {
    return 'grey-lighten-2'
  }

  if (slot.spinning) {
    return 'primary'
  }

  return getBallColor(slot.value)
}


/* =========================================================
 * 선택된 번호인지 (모든 게임의 확정된 값만 대상)
 * ======================================================= */

const isSelected = (number) => {

  return games.value.some(
    (game) =>
      game.slots.some(
        (slot) =>
          !slot.spinning &&
          slot.value === number
      )
  )
}


/* =========================================================
 * 1~45 배열 생성
 * ======================================================= */

const createNumbers = () => {

  return Array.from(
    { length: 45 },
    (_, index) => index + 1
  )
}


/* =========================================================
 * 번호 하나 뽑기
 * ======================================================= */

const pickNumber = (
  available
) => {

  const index =
    Math.floor(
      Math.random() *
      available.length
    )

  return available.splice(
    index,
    1
  )[0]
}


/* =========================================================
 * 추첨 시작
 *
 * 모든 게임이 라운드(1~7번째 번호) 단위로
 * 동시에 추첨된다.
 * ======================================================= */

const startDrawing = async () => {

  if (isDrawing.value) {
    return
  }


  /*
   * 기존 타이머 제거
   */
  clearTimers()


  /*
   * 게임별 정답 번호를 미리 뽑아 둔다.
   * (화면에는 라운드 단위로 순차 공개)
   */
  games.value = Array.from(
    { length: gameCount.value },
    (_, g) => {

      const available =
        createNumbers()

      const selected = []

      for (
        let i = 0;
        i < TOTAL_ROUNDS;
        i++
      ) {
        selected.push(
          pickNumber(available)
        )
      }

      return {
        label: GAME_LABELS[g],
        selected,
        slots: createEmptySlots()
      }
    }
  )


  completed.value = false

  currentRound.value = 0

  isDrawing.value = true


  /*
   * 라운드(1~7번째 번호) 단위로
   * 모든 게임을 동시에 추첨한다.
   */
  for (
    let round = 0;
    round < TOTAL_ROUNDS;
    round++
  ) {

    await drawRound(round)
  }


  currentRound.value = 0

  isDrawing.value = false

  completed.value = true
}


/* =========================================================
 * 한 라운드 추첨
 *
 * 모든 게임의 같은 순번(round) 슬롯을
 * 동시에 스핀시킨 뒤, 동시에 확정한다.
 * ======================================================= */

const drawRound = (
  round
) => {

  currentRound.value =
    round + 1


  games.value.forEach(
    (game) => {
      game.slots[round].spinning = true
    }
  )


  return new Promise((resolve) => {

    let count = 0

    const total = 18


    const interval =
      setInterval(() => {

        games.value.forEach(
          (game) => {

            const finalNumber =
              game.selected[round]

            let randomNumber =
              Math.floor(
                Math.random() * 45
              ) + 1


            /*
             * 최종 번호와 동일한 숫자는
             * 마지막에만 보여준다.
             */
            if (
              count < total - 1 &&
              randomNumber === finalNumber
            ) {
              randomNumber =
                (randomNumber % 45) + 1
            }


            game.slots[round].value =
              randomNumber

          }
        )


        count++


        if (
          count >= total
        ) {

          clearInterval(interval)


          games.value.forEach(
            (game) => {

              game.slots[round].value =
                game.selected[round]

              game.slots[round].spinning =
                false

            }
          )


          resolve()

        }

      }, 70)


    timerIds.push(interval)

  })
}


/* =========================================================
 * 초기화
 * ======================================================= */

const reset = () => {

  clearTimers()

  games.value = []

  isDrawing.value = false

  completed.value = false

  currentRound.value = 0
}


/* =========================================================
 * 타이머 정리
 * ======================================================= */

const clearTimers = () => {

  timerIds.forEach(
    (timer) => {
      clearInterval(timer)
      clearTimeout(timer)
    }
  )

  timerIds.length = 0
}


/* =========================================================
 * 페이지 종료
 * ======================================================= */

onBeforeUnmount(() => {
  clearTimers()
})

</script>


<style scoped>
.ball-spinning {
  animation: ball-pulse 0.35s ease-in-out infinite;
}

@keyframes ball-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
}
</style>