<template>
  <div
      :id="idName"
      @click="generate">
    <slot>
      Download {{ name }}
    </slot>
  </div>
</template>

<script>
const saveData = (function () {
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  return function (data, fileName) {
    const json = data,
        url = window.URL.createObjectURL(json);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };
}());


export default {
  name: 'export-excel',
  props: {
    style: {
      type: String,
      default: 'color: #FFFFFF'
    },
    headerColor: {
      type: String,
      default: '#205737'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'xls'
    },
    data: {
      type: Array,
      required: false,
      default: null
    },
    fields: {
      type: Object,
      required: false
    },
    exportFields: {
      type: Object,
      required: false
    },
    defaultValue: {
      type: String,
      required: false,
      default: ''
    },
    title: {
      default: null
    },
    footer: {
      default: null
    },
    name: {
      type: String,
      default: 'file_excel.xls'
    },
    fetch: {
      type: Function,
    },
    meta: {
      type: Array,
      default: () => []
    },
    worksheet: {
      type: String,
      default: 'Sheet1'
    },
    beforeGenerate: {
      type: Function,
    },
    beforeFinish: {
      type: Function,
    },
  },
  computed: {
    idName() {
      const now = new Date().getTime()
      return 'export_' + now
    },

    // eslint-disable-next-line vue/return-in-computed-property
    downloadFields() {
      if (this.fields !== undefined) return this.fields

      if (this.exportFields !== undefined) return this.exportFields
    }
  },
  methods: {
    saveData,
    async generate() {
      if (this.disabled) {
        return
      }
      if (typeof this.beforeGenerate === 'function') {
        await this.beforeGenerate()
      }
      let data = this.data
      if (typeof this.fetch === 'function' || !data)
        data = await this.fetch()

      if (!data || !data.length) {
        return
      }

      const json = this.getProcessedJson(data, this.downloadFields)
      if (this.type === 'html') {
        return this.export(
            this.jsonToXLS(json),
            this.name.replace('.xls', '.html'),
            'text/html'
        )
      } else if (this.type === 'csv') {
        return this.export(
            this.jsonToCSV(json),
            this.name.replace('.xls', '.csv'),
            'application/csv'
        )
      }
      return this.export(
          this.jsonToXLS(json),
          this.name,
          'application/vnd.ms-excel'
      )
    },

    export: async function (data, filename, mime) {
      const blob = this.base64ToBlob(data, mime)
      if (typeof this.beforeFinish === 'function')
        await this.beforeFinish()
      saveData(blob, filename)
    },

    jsonToXLS(data) {
      const xlsTemp =
          '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta name=ProgId content=Excel.Sheet> <meta name=Generator content="Microsoft Excel 11"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><style>br {mso-data-placement: same-cell;}</style></head><body><table>${table}</table></body></html>'
      let xlsData = '<thead>'
      const colspan = Object.keys(data[0]).length
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const _self = this

      //Header
      if (this.title != null) {
        xlsData += this.parseExtraData(
            this.title,
            '<tr><th style="font-size: 30px" colspan="' + colspan + '">${data}</th></tr>'
        )
      }

      //Fields
      xlsData += '<tr>'
      for (const key in data[0]) {
        xlsData += `<th bgcolor="${this.headerColor}" style="font-size: 18px; color: #FEFEFE">` + key + '</th>'
      }
      xlsData += '</tr>'
      xlsData += '</thead>'

      //Data
      xlsData += '<tbody>'
      data.map(function (item, index) {
        xlsData += '<tr>'
        for (const key in item) {
          xlsData += '<td style="border: 1px solid #303030">' + _self.valueReformattedForMultilines(item[key]) + '</td>'
        }
        xlsData += '</tr>'
      })
      xlsData += '</tbody>'

      //Footer
      if (this.footer != null) {
        xlsData += '<tfoot>'
        xlsData += this.parseExtraData(
            this.footer,
            '<tr><td style="border: 1px solid #303030" colspan="' + colspan + '">${data}</td></tr>'
        )
        xlsData += '</tfoot>'
      }

      return xlsTemp.replace('${table}', xlsData).replace('${worksheet}', this.worksheet)
    },

    jsonToCSV(data) {
      var csvData = []
      //Header
      if (this.title != null) {
        csvData.push(this.parseExtraData(this.title, '${data}\r\n'))
      }
      //Fields
      for (const key in data[0]) {
        csvData.push(key)
        csvData.push(',')
      }
      csvData.pop()
      csvData.push('\r\n')
      //Data
      data.map(function (item) {
        for (const key in item) {
          let escapedCSV = '="' + item[key] + '"' // cast Numbers to string
          if (escapedCSV.match(/[,"\n]/)) {
            escapedCSV = '"' + escapedCSV.replace(/"/g, '""') + '"'
          }
          csvData.push(escapedCSV)
          csvData.push(',')
        }
        csvData.pop()
        csvData.push('\r\n')
      })
      //Footer
      if (this.footer != null) {
        csvData.push(this.parseExtraData(this.footer, '${data}\r\n'))
      }
      return csvData.join('')
    },

    getProcessedJson(data, header) {
      const keys = this.getKeys(data, header)
      const newData = []
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const _self = this
      data.map(function (item, index) {
        const newItem = {}
        for (const label in keys) {
          const property = keys[label]
          newItem[label] = _self.getValue(property, item)
        }
        newData.push(newItem)
      })

      return newData
    },

    getKeys(data, header) {
      if (header) {
        return header
      }

      const keys = {}
      for (const key in data[0]) {
        keys[key] = key
      }
      return keys
    },

    parseExtraData(extraData, format) {
      let parseData = ''
      if (Array.isArray(extraData)) {
        for (var i = 0; i < extraData.length; i++) {
          parseData += format.replace('${data}', extraData[i])
        }
      } else {
        parseData += format.replace('${data}', extraData)
      }
      return parseData
    },

    getValue(key, item) {
      const field = typeof key !== 'object' ? key : key.field
      const indexes = typeof field !== 'string' ? [] : field.split('.')
      let value = this.defaultValue

      if (!field)
        value = item
      else if (indexes.length > 1)
        value = this.getValueFromNestedItem(item, indexes)
      else
        value = this.parseValue(item[field])

      // eslint-disable-next-line no-prototype-builtins
      if (key.hasOwnProperty('callback'))
        value = this.getValueFromCallback(value, key.callback)

      return value
    },

    valueReformattedForMultilines(value) {
      if (typeof (value) == 'string') return (value.replace(/\n/ig, '<br/>'))
      else return (value)
    },

    getValueFromNestedItem(item, indexes) {
      let nestedItem = item
      for (const index of indexes) {
        if (nestedItem)
          nestedItem = nestedItem[index]
      }
      return this.parseValue(nestedItem)
    },

    getValueFromCallback(item, callback) {
      if (typeof callback !== 'function')
        return this.defaultValue
      const value = callback(item)
      return this.parseValue(value)
    },

    parseValue(value) {
      return value || value === 0 || typeof value === 'boolean'
          ? value
          : this.defaultValue
    },

    base64ToBlob(data, mime) {
      const base64 = window.btoa(window.unescape(encodeURIComponent(data)))
      const bstr = atob(base64)
      let n = bstr.length
      const u8arr = new Uint8ClampedArray(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new Blob([u8arr], {type: mime})
    }
  }
}
</script>
