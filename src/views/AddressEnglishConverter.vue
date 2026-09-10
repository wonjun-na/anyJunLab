<script setup>
import { ref, computed } from 'vue'

const selectedAddress = ref(null)
const detailAddress = ref('')
const isCopied = ref(false)
const copiedField = ref('')

// 카카오 우편번호 팝업 호출 함수
const openPostcode = () => {
  if (!window.daum || !window.daum.Postcode) {
    alert('카카오 주소 서비스 라이브러리가 로드되지 않았습니다.\nindex.html에 script 태그가 포함되어 있는지 확인해주세요.')
    return
  }

  new window.daum.Postcode({
    oncomplete: (data) => {
      // 카카오 API에서 제공하는 영문 주소 데이터 저장
      selectedAddress.value = {
        zipNo: data.zonecode,
        korRoad: data.address,
        korJibun: data.jibunAddress || data.autoJibunAddress,
        engRoad: data.addressEnglish,
        city: data.sidoEnglish,
        state: data.sidoEnglish,
      }
    }
  }).open()
}

// Address Line 1 (기본 영문 주소)
const addressLine1 = computed(() => selectedAddress.value?.engRoad || '')

// Address Line 2 (상세 주소: 동/호수 영문 포맷팅)
const addressLine2 = computed(() => {
  if (!detailAddress.value) return ''
  
  let detail = detailAddress.value.trim()
  return detail
    .replace(/([0-9]+)\s*동\s*([0-9]+)\s*호/g, 'Apt $1-$2')
    .replace(/([0-9]+)\s*호/g, 'Rm $1')
    .replace(/([0-9]+)\s*층/g, '$1F')
})

// 클립보드 복사 함수
const copyToClipboard = (text, fieldName) => {
  if (!text) return
  navigator.clipboard.writeText(text).then(() => {
    copiedField.value = fieldName
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
      copiedField.value = ''
    }, 2000)
  })
}
</script>

<template>
  <v-app>
    <v-main class="bg-grey-lighten-4">
      <v-container class="py-8" style="max-width: 900px;">
        <!-- 헤더 -->
        <div class="mb-8 text-center text-md-start">
          <v-chip color="primary" variant="tonal" prepend-icon="mdi-earth" class="mb-3">
            해외직구 필수 도구
          </v-chip>
          <h1 class="text-h4 font-weight-bold mb-2">영문 주소 변환기</h1>
          <p class="text-body-1 text-medium-emphasis">
            우편번호 검색을 통해 한국 주소를 해외 쇼핑몰 입력 양식에 맞는 영문 주소로 변환합니다.
          </p>
        </div>

        <!-- 주소 검색 버튼 카드 -->
        <v-card elevation="1" rounded="xl" class="pa-6 pa-md-8 mb-6 text-center">
          <v-icon icon="mdi-map-marker-search-outline" size="48" color="primary" class="mb-3" />
          <h2 class="text-h6 font-weight-bold mb-2">주소 검색하기</h2>
          <p class="text-body-2 text-medium-emphasis mb-5">
            버튼을 눌러 도로명 주소 또는 지번 주소를 검색하세요.
          </p>
          <v-btn
            color="primary"
            size="large"
            rounded="lg"
            prepend-icon="mdi-magnify"
            class="px-8 font-weight-bold"
            @click="openPostcode"
          >
            우편번호 / 주소 검색
          </v-btn>
        </v-card>

        <!-- 변환 결과 카드 -->
        <v-card v-if="selectedAddress" elevation="2" rounded="xl" class="pa-5 pa-md-7 mb-6 border-primary">
          <div class="d-flex align-center mb-6">
            <v-icon icon="mdi-card-text-outline" color="primary" class="mr-2" />
            <h2 class="text-h6 font-weight-bold">해외 직구 입력용 영문 주소</h2>
            <v-spacer />
            <v-chip color="success" size="small" variant="flat">변환 완료</v-chip>
          </div>

          <!-- 한글 주소 요약 -->
          <v-sheet color="grey-lighten-4" rounded="lg" class="pa-4 mb-6">
            <div class="text-caption text-medium-emphasis">선택한 주소 (한글)</div>
            <div class="font-weight-bold text-body-1">
              [{{ selectedAddress.zipNo }}] {{ selectedAddress.korRoad }}
            </div>
          </v-sheet>

          <v-row>
            <!-- 1. Address Line 1 -->
            <v-col cols="12">
                <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-subtitle-2 font-weight-bold text-primary">
                    Address Line 1 <span class="text-caption text-medium-emphasis">(기본 도로명 주소)</span>
                </span>
                <v-btn
                    size="small"
                    variant="text"
                    color="primary"
                    prepend-icon="mdi-content-copy"
                    @click="copyToClipboard(addressLine1, 'Line 1')"
                >
                    복사
                </v-btn>
                </div>
                <v-text-field
                :model-value="addressLine1"
                readonly
                variant="filled"
                density="comfortable"
                hide-details
                />
            </v-col>

            <!-- 2. 상세 주소 입력 (왼쪽) -->
            <v-col cols="12" md="6">
                <div class="d-flex align-center mb-1" style="height: 32px;">
                <span class="text-subtitle-2 font-weight-bold">
                    상세 주소 입력 <span class="text-caption text-medium-emphasis">(동/호수)</span>
                </span>
                </div>
                <v-text-field
                v-model="detailAddress"
                placeholder="예: 103동 3103호"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-home-floor-g"
                hide-details
                clearable
                />
            </v-col>

            <!-- 3. Address Line 2 결과 (오른쪽) -->
            <v-col cols="12" md="6">
                <div class="d-flex justify-space-between align-center mb-1" style="height: 32px;">
                <span class="text-subtitle-2 font-weight-bold text-primary">
                    Address Line 2 <span class="text-caption text-medium-emphasis">(상세 주소 영문)</span>
                </span>
                <v-btn
                    size="small"
                    variant="text"
                    color="primary"
                    prepend-icon="mdi-content-copy"
                    @click="copyToClipboard(addressLine2, 'Line 2')"
                >
                    복사
                </v-btn>
                </div>
                <v-text-field
                :model-value="addressLine2 || '상세 주소를 입력하세요'"
                readonly
                variant="filled"
                density="comfortable"
                hide-details
                />
            </v-col>

            <!-- 4. City & State & Zipcode -->
            <v-col cols="12" md="4" class="mt-2">
                <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-caption font-weight-bold">City (도시)</span>
                <v-btn size="x-small" variant="text" @click="copyToClipboard(selectedAddress.city, 'City')">복사</v-btn>
                </div>
                <v-text-field :model-value="selectedAddress.city" readonly variant="outlined" density="compact" hide-details />
            </v-col>

            <v-col cols="12" md="4" class="mt-2">
                <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-caption font-weight-bold">State / Province (도/시)</span>
                <v-btn size="x-small" variant="text" @click="copyToClipboard(selectedAddress.state, 'State')">복사</v-btn>
                </div>
                <v-text-field :model-value="selectedAddress.state" readonly variant="outlined" density="compact" hide-details />
            </v-col>

            <v-col cols="12" md="4" class="mt-2">
                <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-caption font-weight-bold">ZIP / Postal Code (우편번호)</span>
                <v-btn size="x-small" variant="text" @click="copyToClipboard(selectedAddress.zipNo, 'Zip Code')">복사</v-btn>
                </div>
                <v-text-field :model-value="selectedAddress.zipNo" readonly variant="outlined" density="compact" hide-details />
            </v-col>
            </v-row>
        </v-card>

        <!-- 작성 가이드 안내 -->
        <v-alert type="info" variant="tonal" rounded="xl" icon="mdi-help-circle-outline">
          <div class="font-weight-bold mb-1">💡 상세주소(동/호수) 영문 표기 팁</div>
          <ul class="text-body-2 pl-4">
            <li><strong>101동 202호</strong>: <code>Apt 101-202</code></li>
            <li><strong>202호</strong>: <code>Rm 202</code></li>
            <li><strong>지하 1층</strong>: <code>B1</code></li>
          </ul>
        </v-alert>

        <!-- 복사 완료 토스트 -->
        <v-snackbar v-model="isCopied" timeout="2000" color="black" location="bottom">
          <v-icon icon="mdi-check-circle" color="success" class="mr-2" />
          {{ copiedField }} 항목이 클립보드에 복사되었습니다!
        </v-snackbar>
      </v-container>
    </v-main>
  </v-app>
</template>