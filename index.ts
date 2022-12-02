// @ts-ignore
import ExportExcel from './ExportExcel.vue';

export default {
    install(Vue: any, options: any) {
        Vue.component("export-excel", ExportExcel);
    }
};