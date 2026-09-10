<script setup>
import { computed, ref, watch } from 'vue'

// 입력 필드 표시용 (콤마 적용)
const displayLoanAmount = ref('300,000,000')
// 계산용 실제 숫자 값
const loanAmount = ref(300000000)

const annualRate = ref(4.5)
const loanTerm = ref(30)
const repaymentType = ref('equal')

const repaymentOptions = [
    { title: '원리금균등상환', value: 'equal' },    
    { title: '체증식상환', value: 'graduated' },  
    { title: '원금균등상환', value: 'principal' },
    { title: '만기일시상환', value: 'bullet' },
]

const formatMoney = (value) => {
  return new Intl.NumberFormat('ko-KR').format(
    Math.round(value || 0),
  )
}

// 대출금액 콤마 처리
const updateLoanAmount = (val) => {
  const num = Number(String(val).replace(/[^0-9]/g, ''))
  loanAmount.value = num
  displayLoanAmount.value = num ? formatMoney(num) : ''
}

const setLoanAmount = (val) => {
  loanAmount.value = val
  displayLoanAmount.value = formatMoney(val)
}

const monthlyRate = computed(() => {
  return Number(annualRate.value) / 100 / 12
})

const totalMonths = computed(() => {
  return Number(loanTerm.value) * 12
})

const schedule = computed(() => {
  const principal = Number(loanAmount.value)
  const rate = monthlyRate.value
  const months = totalMonths.value

  if (principal <= 0 || months <= 0) {
    return []
  }

  const result = []

  // 1. 원리금균등상환
  if (repaymentType.value === 'equal') {
    const monthlyPayment =
      rate === 0
        ? principal / months
        : (principal * rate * Math.pow(1 + rate, months)) /
          (Math.pow(1 + rate, months) - 1)

    let balance = principal

    for (let month = 1; month <= months; month++) {
      const interest = balance * rate
      let principalPayment = monthlyPayment - interest

      if (month === months) {
        principalPayment = balance
      }

      const payment = principalPayment + interest
      balance = Math.max(0, balance - principalPayment)

      result.push({ month, payment, principal: principalPayment, interest, balance })
    }
  }

  // 2. 원금균등상환
  if (repaymentType.value === 'principal') {
    const monthlyPrincipal = principal / months
    let balance = principal

    for (let month = 1; month <= months; month++) {
      const interest = balance * rate
      let principalPayment = monthlyPrincipal

      if (month === months) {
        principalPayment = balance
      }

      const payment = principalPayment + interest
      balance = Math.max(0, balance - principalPayment)

      result.push({ month, payment, principal: principalPayment, interest, balance })
    }
  }

  // 3. 체증식상환 (원금 납입액이 매달 수식에 따라 일정하게 증가)
  if (repaymentType.value === 'graduated') {
    let balance = principal
    // 매월 상환 원금의 기준 산출
    const basePrincipal = (2 * principal) / (months * (months + 1))

    for (let month = 1; month <= months; month++) {
      const interest = balance * rate
      let principalPayment = basePrincipal * month

      if (month === months) {
        principalPayment = balance
      }

      const payment = principalPayment + interest
      balance = Math.max(0, balance - principalPayment)

      result.push({ month, payment, principal: principalPayment, interest, balance })
    }
  }

  // 4. 만기일시상환
  if (repaymentType.value === 'bullet') {
    const monthlyInterest = principal * rate

    for (let month = 1; month <= months; month++) {
      const isLastMonth = month === months

      result.push({
        month,
        payment: monthlyInterest + (isLastMonth ? principal : 0),
        principal: isLastMonth ? principal : 0,
        interest: monthlyInterest,
        balance: isLastMonth ? 0 : principal,
      })
    }
  }

  return result
})

const firstPayment = computed(() => schedule.value[0]?.payment || 0)
const lastPayment = computed(() => schedule.value.at(-1)?.payment || 0)
const totalInterest = computed(() => schedule.value.reduce((sum, item) => sum + item.interest, 0))
const totalPayment = computed(() => schedule.value.reduce((sum, item) => sum + item.payment, 0))

const repaymentName = computed(() => {
  return repaymentOptions.find((item) => item.value === repaymentType.value)?.title
})

const reset = () => {
  setLoanAmount(300000000)
  annualRate.value = 4.5
  loanTerm.value = 30
  repaymentType.value = 'equal'
}
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
            prepend-icon="mdi-calculator-variant"
            class="mb-4"
          >
            금융 계산기
          </v-chip>

          <h1 class="text-h4 text-md-h3 font-weight-bold mb-3">
            대출이자계산기
          </h1>

          <p class="text-body-1 text-medium-emphasis">
            대출금액, 금리, 기간과 상환방식을 입력하면
            예상 상환금액을 계산할 수 있습니다.
          </p>
        </div>

        <!-- 입력 -->
        <v-card
          elevation="1"
          rounded="xl"
          class="pa-5 pa-md-7 mb-6"
        >
          <div class="d-flex align-center mb-6">
            <v-icon
              icon="mdi-calculator"
              color="primary"
              class="mr-2"
            />

            <h2 class="text-h6 font-weight-bold">
              대출 조건
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
            <!-- 대출금액 (콤마 적용) -->
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                :model-value="displayLoanAmount"
                @update:model-value="updateLoanAmount"
                label="대출금액"
                suffix="원"
                variant="outlined"
                prepend-inner-icon="mdi-cash"
                hide-details
              />

              <div class="d-flex ga-2 mt-2">
                <v-btn
                  size="small"
                  variant="tonal"
                  @click="setLoanAmount(100000000)"
                >
                  1억
                </v-btn>

                <v-btn
                  size="small"
                  variant="tonal"
                  @click="setLoanAmount(300000000)"
                >
                  3억
                </v-btn>

                <v-btn
                  size="small"
                  variant="tonal"
                  @click="setLoanAmount(500000000)"
                >
                  5억
                </v-btn>
              </div>
            </v-col>

            <!-- 금리 -->
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model.number="annualRate"
                label="연이율"
                type="number"
                suffix="%"
                step="0.01"
                min="0"
                variant="outlined"
                prepend-inner-icon="mdi-percent"
                hide-details
              />
            </v-col>

            <!-- 기간 -->
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model.number="loanTerm"
                label="대출기간"
                type="number"
                suffix="년"
                min="1"
                max="50"
                variant="outlined"
                prepend-inner-icon="mdi-calendar-clock"
                hide-details
              />
            </v-col>

            <!-- 상환방식 (체증식 추가됨) -->
            <v-col cols="12">
              <div class="text-subtitle-2 font-weight-bold mb-3">
                상환방식
              </div>

              <v-btn-toggle
                v-model="repaymentType"
                color="primary"
                divided
                mandatory
                class="w-100"
              >
                <v-btn
                  v-for="option in repaymentOptions"
                  :key="option.value"
                  :value="option.value"
                  class="flex-grow-1"
                >
                  {{ option.title }}
                </v-btn>
              </v-btn-toggle>
            </v-col>
          </v-row>
        </v-card>

        <!-- 결과 -->
        <v-card
          elevation="1"
          rounded="xl"
          class="pa-5 pa-md-7 mb-6"
        >
          <div class="d-flex align-center mb-5">
            <v-icon
              icon="mdi-chart-box-outline"
              color="primary"
              class="mr-2"
            />

            <h2 class="text-h6 font-weight-bold">
              계산 결과
            </h2>
          </div>

          <v-row>
            <v-col
              cols="12"
              sm="6"
              md="3"
            >
              <v-card
                color="primary"
                variant="tonal"
                rounded="lg"
                class="pa-4 h-100"
              >
                <div class="text-body-2 mb-2">
                  첫 달 상환금액
                </div>

                <div class="text-h6 font-weight-bold">
                  {{ formatMoney(firstPayment) }}원
                </div>
              </v-card>
            </v-col>

            <v-col
              cols="12"
              sm="6"
              md="3"
            >
              <v-card
                color="blue"
                variant="tonal"
                rounded="lg"
                class="pa-4 h-100"
              >
                <div class="text-body-2 mb-2">
                  마지막 달 상환금액
                </div>

                <div class="text-h6 font-weight-bold">
                  {{ formatMoney(lastPayment) }}원
                </div>
              </v-card>
            </v-col>

            <v-col
              cols="12"
              sm="6"
              md="3"
            >
              <v-card
                color="orange"
                variant="tonal"
                rounded="lg"
                class="pa-4 h-100"
              >
                <div class="text-body-2 mb-2">
                  총 이자
                </div>

                <div class="text-h6 font-weight-bold">
                  {{ formatMoney(totalInterest) }}원
                </div>
              </v-card>
            </v-col>

            <v-col
              cols="12"
              sm="6"
              md="3"
            >
              <v-card
                color="green"
                variant="tonal"
                rounded="lg"
                class="pa-4 h-100"
              >
                <div class="text-body-2 mb-2">
                  총 상환액
                </div>

                <div class="text-h6 font-weight-bold">
                  {{ formatMoney(totalPayment) }}원
                </div>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="my-6" />

          <v-row>
            <v-col
              cols="6"
              md="3"
            >
              <div class="text-caption text-medium-emphasis">
                대출금액
              </div>

              <div class="font-weight-bold">
                {{ formatMoney(loanAmount) }}원
              </div>
            </v-col>

            <v-col
              cols="6"
              md="3"
            >
              <div class="text-caption text-medium-emphasis">
                연이율
              </div>

              <div class="font-weight-bold">
                {{ annualRate }}%
              </div>
            </v-col>

            <v-col
              cols="6"
              md="3"
            >
              <div class="text-caption text-medium-emphasis">
                대출기간
              </div>

              <div class="font-weight-bold">
                {{ loanTerm }}년
              </div>
            </v-col>

            <v-col
              cols="6"
              md="3"
            >
              <div class="text-caption text-medium-emphasis">
                상환방식
              </div>

              <div class="font-weight-bold">
                {{ repaymentName }}
              </div>
            </v-col>
          </v-row>
        </v-card>

        <!-- 월별 상환표 -->
        <v-card
          elevation="1"
          rounded="xl"
          class="pa-5 pa-md-7 mb-6"
        >
          <div class="mb-5">
            <h2 class="text-h6 font-weight-bold">
              월별 상환 스케줄
            </h2>

            <p class="text-body-2 text-medium-emphasis mt-1">
              전체 상환기간의 원금과 이자를 확인할 수 있습니다.
            </p>
          </div>

          <v-table
            fixed-header
            height="500"
            density="comfortable"
          >
            <thead>
              <tr>
                <th class="text-center">
                  회차
                </th>
                <th class="text-end">
                  월 상환금액
                </th>
                <th class="text-end">
                  원금
                </th>
                <th class="text-end">
                  이자
                </th>
                <th class="text-end">
                  남은 원금
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="item in schedule"
                :key="item.month"
              >
                <td class="text-center">
                  {{ item.month }}회
                </td>

                <td class="text-end">
                  {{ formatMoney(item.payment) }}원
                </td>

                <td class="text-end">
                  {{ formatMoney(item.principal) }}원
                </td>

                <td class="text-end">
                  {{ formatMoney(item.interest) }}원
                </td>

                <td class="text-end">
                  {{ formatMoney(item.balance) }}원
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>

        <!-- 안내 -->
        <v-alert
          type="info"
          variant="tonal"
          rounded="lg"
          icon="mdi-information-outline"
        >
          <div class="font-weight-bold mb-1">
            계산 결과 안내
          </div>

          실제 금융기관의 상환금액은 적용금리,
          이자 계산 방식, 상환일 및 기타 조건에 따라
          달라질 수 있습니다.
        </v-alert>
      </v-container>
    </v-main>
  </v-app>
</template>