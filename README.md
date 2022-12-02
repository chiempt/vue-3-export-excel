# Vue export excel

Download excel file from json data

## Get Started (Bắt đầu)

```npm i vue-3-export-excel```

## How to use the library in vue (Cách sử dụng thư viện trong vue)

``` 
import { createApp } from 'vue'
import ExportExcel from 'vue-3-export-excel'
const app = createApp(App)
app.use(ExportExcel) 
```

## Example (Ví dụ)

```vue

<template>
  <export-excel
      :data="dataExcel"
      :fields="excelFields"
      :title="`Thông tin cá nhân`"
      :name="`Thong_tin_ca_nhan_pham_the_chiem.xls`">
    <button>Download Excel</button>
  </export-excel>
</template>
<script lang="ts" setup>
const excelFields = {
  'Tên': 'name',
  'Tên đăng nhập': 'userName',
  'Ngày sinh': 'birthDay',
  'Số điện thoại': 'phoneNumber',
  'Địa chỉ': 'address',
  'Địa chỉ facebook': 'facebook'
}
const dataExcel = [
  {
    name: 'Phạm Thế Chiêm',
    userName: 'chiempt',
    birthDay: '27/09/1999',
    phoneNumber: '0345361887',
    address: 'Hoài Đức - Hà Nội',
    facebook: 'https://www.facebook.com/chiem.dieu.18/'
  }
]
</script>
```

### Props

```js
  headerColor: {
      type: String,
      default: '#205737'
      description: 'Màu header'
    },
    disabled: {
      type: Boolean,
      default: false,
      description: 'Không cho phép xuất excel'
    },
    type: {
      type: String,
      default: 'xls',
      description: 'Địng dạng xuất file'
    },
    data: {
      type: Array,
      required: false,
      default: null,
      description: 'Dữ liệu table excel'
    },
    fields: {
      type: Object,
      required: false,
       description: 'Định nghĩa các trường trong table'
    },
    title: {
      default: null,
       description: 'Tiêu đề excel'
    },
    name: {
      type: String,
      default: 'file_excel.xls',
      description: 'Tên file'
    }

