import ExportExcel from "./ExportExcel.vue";

export default {
    install(Vue, options) {
        Vue.component("export-excel", ExportExcel);
    }
};