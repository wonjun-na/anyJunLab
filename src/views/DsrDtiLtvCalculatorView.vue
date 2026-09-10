<script setup>
import { computed, ref } from 'vue'

// --- 입력 상태 관리 ---
// 1. 부동산 가격 및 주택담보대출 (LTV 계산용)
const propertyValue = ref(500000000)
const displayPropertyValue = ref('500,000,000')

const mortgageAmount = ref(300000000)
const displayMortgageAmount = ref('300,000,000')

const mortgageRate = ref(4.5)
const mortgageTerm = ref(30)
const mortgageRepaymentType = ref('equal') // equal, principal, gradual, bullet

// 2. 소득 및 기타 부채 (DTI/DSR 계산용)
const annualIncome = ref(60000000)
const displayAnnualIncome = ref('60,000,000')

const otherAnnualRepayment = ref(0) // 기타 대출 연간 원리금 상환액
const displayOtherAnnualRepayment = ref('0')

// 상환 방식 옵션
const repaymentOptions = [
  { title: '원리금균등상환', value: 'equal' },
  { title: '원금균등상환', value: 'principal' },
  { title: '체증식분할상환 (초기 부담 적음)', value: 'gradual' },
  { title: '만기일시상환', value: 'bullet' },
]

// --- 유틸리티 함수 ---
const formatMoney = (value) => {
  return new Intl.NumberFormat('ko-KR').format(Math.round(value || 0))
}

const parseNumber = (val) => Number(String(val || '').replace(/[^0-9]/g, ''))

// 필드별 입력 이벤트 핸들러
const onPropertyValueInput = (val) => {
  const num = parseNumber(val)
  propertyValue.value = num
  displayPropertyValue.value = num ? formatMoney(num) : ''
}

const onMortgageAmountInput = (val) => {
  const num = parseNumber(val)
  mortgageAmount.value = num
  displayMortgageAmount.value = num ? formatMoney(num) : ''
}

const onAnnualIncomeInput = (val) => {
  const num = parseNumber(val)
  annualIncome.value = num
  displayAnnualIncome.value = num ? formatMoney(num) : ''
}

const onOtherAnnualRepaymentInput = (val) => {
  const num = parseNumber(val)
  otherAnnualRepayment.value = num
  displayOtherAnnualRepayment.value = num ? formatMoney(num) : ''
}

// 퀵 버튼 설정 핸들러
const setFieldValue = (val, targetRef, displayRef) => {
  targetRef.value = val
  displayRef.value = formatMoney(val)
}

// --- 계산 로직 ---
// 신규 주택담보대출의 연간 원리금 상환액 산출 (DSR 분자 계산용)
const annualMortgagePayment = computed(() => {
  const p = Number(mortgageAmount.value)
  const r = Number(mortgageRate.value) / 100 / 12
  const n = Number(mortgageTerm.value) * 12
  const termYears = Number(mortgageTerm.value)

  if (p <= 0 || n <= 0) return 0

  // 1. 원리금균등상환
  if (mortgageRepaymentType.value === 'equal') {
    const monthly = r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    return monthly * 12
  }
  
  // 2. 원금균등상환 (첫해 12개월 원금 + 이자 합산)
  else if (mortgageRepaymentType.value === 'principal') {
    const monthlyPrincipal = p / n
    let firstYearInterest = 0
    let balance = p
    for (let i = 0; i < 12; i++) {
      firstYearInterest += balance * r
      balance -= monthlyPrincipal
    }
    return monthlyPrincipal * 12 + firstYearInterest
  }

  // 3. 체증식 분할상환
  else if (mortgageRepaymentType.value === 'gradual') {
    let totalFirstYear = 0
    let balance = p
    const factor = Math.pow(1 + r, n) - 1
    for (let month = 1; month <= 12; month++) {
      const monthlyPrincipal = factor === 0 ? p / n : (p * r * Math.pow(1 + r, month - 1)) / factor
      const monthlyInterest = balance * r
      totalFirstYear += (monthlyPrincipal + monthlyInterest)
      balance -= monthlyPrincipal
    }
    return totalFirstYear
  }

  // 4. 만기일시상환 (DSR 규제 산정 공식: 대출원금 / 약정만기(최대10년 분할) + 연간 이자)
  else if (mortgageRepaymentType.value === 'bullet') {
    const dsrPrincipalTerm = Math.min(termYears, 10)
    const annualPrincipalForDsr = p / (dsrPrincipalTerm || 1)
    const annualInterest = p * (Number(mortgageRate.value) / 100)
    return annualPrincipalForDsr + annualInterest
  }

  return 0
})

// 1. LTV (주택담보대출비율) = 대출금액 / 부동산 가액 * 100
const ltv = computed(() => {
  if (propertyValue.value <= 0) return 0
  return (mortgageAmount.value / propertyValue.value) * 100
})

// 2. DTI (총부채상환비율) = (주담대 연간 원리금 + 기타대출 연간 이자) / 연소득 * 100
const dti = computed(() => {
  if (annualIncome.value <= 0) return 0
  let dtiMortgagePayment = annualMortgagePayment.value
  if (mortgageRepaymentType.value === 'bullet') {
    dtiMortgagePayment = mortgageAmount.value * (Number(mortgageRate.value) / 100)
  }
  
  const total = dtiMortgagePayment + (otherAnnualRepayment.value * 0.3)
  return (total / annualIncome.value) * 100
})

// 3. DSR (총부채원리금상환비율) = (주담대 연간 원리금 + 기타대출 연간 원리금) / 연소득 * 100
const dsr = computed(() => {
  if (annualIncome.value <= 0) return 0
  const total = annualMortgagePayment.value + Number(otherAnnualRepayment.value)
  return (total / annualIncome.value) * 100
})

// 규제 등급 상태 산출 (DSR 기준)
const dsrStatus = computed(() => {
  if (dsr.value <= 40) return { text: '안전 (1금융권 이내)', color: 'green' }
  if (dsr.value <= 50) return { text: '주의 (2금융권 한도)', color: 'warning' }
  return { text: '초과 (대출 제한 가능)', color: 'error' }
})

const reset = () => {
  setFieldValue(500000000, propertyValue, displayPropertyValue)
  setFieldValue(300000000, mortgageAmount, displayMortgageAmount)
  setFieldValue(60000000, annualIncome, displayAnnualIncome)
  setFieldValue(0, otherAnnualRepayment, displayOtherAnnualRepayment)
  mortgageRate.value = 4.5
  mortgageTerm.value = 30
  mortgageRepaymentType.value = 'equal'
}
</script>

<template>
  <v-app>
    <v-main class="bg-grey-lighten-4">
      <v-container class="py-8">
        <!-- 페이지 제목 -->
        <div class="mb-8">
          <v-chip color="primary" variant="tonal" prepend-icon="mdi-calculator" class="mb-4">
            금융 규제 계산기
          </v-chip>

          <h1 class="text-h4 text-md-h3 font-weight-bold mb-3">
            DSR / DTI / LTV 계산기
          </h1>

          <p class="text-body-1 text-medium-emphasis">
            부동산 가액, 대출 정보 및 연소득을 입력하여 나의 대출 가능 한도 규제 비율을 계산합니다.
          </p>
        </div>

        <!-- 조건 입력 카드 -->
        <v-card elevation="1" rounded="xl" class="pa-5 pa-md-7 mb-6">
          <div class="d-flex align-center mb-6">
            <v-icon icon="mdi-home-analytics" color="primary" class="mr-2" />
            <h2 class="text-h6 font-weight-bold">부동산 및 대출 조건</h2>
            <v-spacer />
            <v-btn variant="text" size="small" prepend-icon="mdi-refresh" @click="reset">
              초기화
            </v-btn>
          </div>

          <v-row>
            <!-- 부동산 평가액 -->
            <v-col cols="12" md="6">
              <v-text-field
                :model-value="displayPropertyValue"
                @update:model-value="onPropertyValueInput"
                label="부동산 평가액 (시세)"
                suffix="원"
                variant="outlined"
                prepend-inner-icon="mdi-home-city"
                hide-details
              />
              <div class="d-flex ga-2 mt-2">
                <v-btn size="small" variant="tonal" @click="setFieldValue(300000000, propertyValue, displayPropertyValue)">3억</v-btn>
                <v-btn size="small" variant="tonal" @click="setFieldValue(600000000, propertyValue, displayPropertyValue)">6억</v-btn>
                <v-btn size="small" variant="tonal" @click="setFieldValue(900000000, propertyValue, displayPropertyValue)">9억</v-btn>
              </div>
            </v-col>

            <!-- 주택담보대출 신청금액 -->
            <v-col cols="12" md="6">
              <v-text-field
                :model-value="displayMortgageAmount"
                @update:model-value="onMortgageAmountInput"
                label="신규 대출 신청금액"
                suffix="원"
                variant="outlined"
                prepend-inner-icon="mdi-cash-multiple"
                hide-details
              />
              <div class="d-flex ga-2 mt-2">
                <v-btn size="small" variant="tonal" @click="setFieldValue(100000000, mortgageAmount, displayMortgageAmount)">1억</v-btn>
                <v-btn size="small" variant="tonal" @click="setFieldValue(300000000, mortgageAmount, displayMortgageAmount)">3억</v-btn>
                <v-btn size="small" variant="tonal" @click="setFieldValue(500000000, mortgageAmount, displayMortgageAmount)">5억</v-btn>
              </div>
            </v-col>

            <!-- 대출 금리 -->
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="mortgageRate"
                label="대출 금리"
                type="number"
                suffix="%"
                step="0.01"
                variant="outlined"
                prepend-inner-icon="mdi-percent"
                hide-details
              />
            </v-col>

            <!-- 대출 기간 -->
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="mortgageTerm"
                label="대출 기간"
                type="number"
                suffix="년"
                variant="outlined"
                prepend-inner-icon="mdi-calendar-clock"
                hide-details
              />
            </v-col>

            <!-- 상환 방식 -->
            <v-col cols="12" md="4">
              <v-select
                v-model="mortgageRepaymentType"
                :items="repaymentOptions"
                item-title="title"
                item-value="value"
                label="상환 방식"
                variant="outlined"
                prepend-inner-icon="mdi-finance"
                hide-details
              />
            </v-col>
          </v-row>

          <v-divider class="my-6" />

          <div class="d-flex align-center mb-6">
            <v-icon icon="mdi-account-cash" color="primary" class="mr-2" />
            <h2 class="text-h6 font-weight-bold">소득 및 기존 부채 정보</h2>
          </div>

          <v-row>
            <!-- 연소득 -->
            <v-col cols="12" md="6">
              <v-text-field
                :model-value="displayAnnualIncome"
                @update:model-value="onAnnualIncomeInput"
                label="연간 세전 소득"
                suffix="원"
                variant="outlined"
                prepend-inner-icon="mdi-wallet"
                hide-details
              />
              <div class="d-flex ga-2 mt-2">
                <v-btn size="small" variant="tonal" @click="setFieldValue(40000000, annualIncome, displayAnnualIncome)">4천만</v-btn>
                <v-btn size="small" variant="tonal" @click="setFieldValue(60000000, annualIncome, displayAnnualIncome)">6천만</v-btn>
                <v-btn size="small" variant="tonal" @click="setFieldValue(80000000, annualIncome, displayAnnualIncome)">8천만</v-btn>
              </div>
            </v-col>

            <!-- 기타 대출 연간 원리금 -->
            <v-col cols="12" md="6">
              <v-text-field
                :model-value="displayOtherAnnualRepayment"
                @update:model-value="onOtherAnnualRepaymentInput"
                label="기타 대출 연간 원리금 상환액"
                suffix="원"
                variant="outlined"
                prepend-inner-icon="mdi-credit-card-outline"
                hide-details
              />
              <div class="d-flex ga-2 mt-2">
                <v-btn size="small" variant="tonal" @click="setFieldValue(0, otherAnnualRepayment, displayOtherAnnualRepayment)">없음</v-btn>
                <v-btn size="small" variant="tonal" @click="setFieldValue(5000000, otherAnnualRepayment, displayOtherAnnualRepayment)">500만</v-btn>
                <v-btn size="small" variant="tonal" @click="setFieldValue(10000000, otherAnnualRepayment, displayOtherAnnualRepayment)">1,000만</v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card>

        <!-- 결과 리포트 카드 -->
        <v-card elevation="1" rounded="xl" class="pa-5 pa-md-7 mb-6">
          <div class="d-flex align-center mb-5">
            <v-icon icon="mdi-chart-donut" color="primary" class="mr-2" />
            <h2 class="text-h6 font-weight-bold">지표 분석 결과</h2>
          </div>

          <v-row>
            <!-- LTV 결과 -->
            <v-col cols="12" md="4">
              <v-card color="primary" variant="tonal" rounded="lg" class="pa-4 h-100">
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-body-2">LTV (주택담보대출비율)</span>
                  <v-chip size="x-small" color="primary">담보기준</v-chip>
                </div>
                <div class="text-h4 font-weight-bold mb-1">
                  {{ ltv.toFixed(1) }}%
                </div>
                <div class="text-caption text-medium-emphasis">
                  부동산 가액 대비 대출 비율
                </div>
              </v-card>
            </v-col>

            <!-- DTI 결과 -->
            <v-col cols="12" md="4">
              <v-card color="blue" variant="tonal" rounded="lg" class="pa-4 h-100">
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-body-2">DTI (총부채상환비율)</span>
                  <v-chip size="x-small" color="blue">소득기준</v-chip>
                </div>
                <div class="text-h4 font-weight-bold mb-1">
                  {{ dti.toFixed(1) }}%
                </div>
                <div class="text-caption text-medium-emphasis">
                  소득 대비 주담대 원리금 비율
                </div>
              </v-card>
            </v-col>

            <!-- DSR 결과 -->
            <v-col cols="12" md="4">
              <v-card :color="dsrStatus.color" variant="tonal" rounded="lg" class="pa-4 h-100">
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-body-2">DSR (총부채원리금상환)</span>
                  <v-chip size="x-small" :color="dsrStatus.color">{{ dsrStatus.text }}</v-chip>
                </div>
                <div class="text-h4 font-weight-bold mb-1">
                  {{ dsr.toFixed(1) }}%
                </div>
                <div class="text-caption text-medium-emphasis">
                  전체 대출 원리금 상환 부담 비율
                </div>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="my-6" />

          <!-- 세부 금액 요약 -->
          <v-row>
            <v-col cols="6" md="3">
              <div class="text-caption text-medium-emphasis">부동산 평가액</div>
              <div class="font-weight-bold">{{ formatMoney(propertyValue) }}원</div>
            </v-col>

            <v-col cols="6" md="3">
              <div class="text-caption text-medium-emphasis">DSR 산정 주담대 연간 상환액</div>
              <div class="font-weight-bold">{{ formatMoney(annualMortgagePayment) }}원</div>
            </v-col>

            <v-col cols="6" md="3">
              <div class="text-caption text-medium-emphasis">기타대출 연간 원리금</div>
              <div class="font-weight-bold">{{ formatMoney(otherAnnualRepayment) }}원</div>
            </v-col>

            <v-col cols="6" md="3">
              <div class="text-caption text-medium-emphasis">연간 총 원리금 상환액</div>
              <div class="font-weight-bold text-primary">
                {{ formatMoney(annualMortgagePayment + Number(otherAnnualRepayment)) }}원
              </div>
            </v-col>
          </v-row>
        </v-card>

        <!-- 설명 가이드 알림 -->
        <v-alert type="info" variant="tonal" rounded="lg" icon="mdi-information-outline">
          <div class="font-weight-bold mb-1">상환 방식 관련 안내</div>
          * <strong>체증식 분할상환</strong>: 만 40세 미만(보금자리론 등) 지원 방식으로 초기 상환 부담이 가장 적어 초기 DSR 계산 시 유리합니다.<br />
          * <strong>만기일시상환</strong>: DSR 규제 심사 시 실제 납부액과 별개로 대출원금을 최대 10년 산정 기준(산정 원금+이자)으로 나눈 산식이 적용됩니다.
        </v-alert>
      </v-container>
    </v-main>
  </v-app>
</template>