define('components/utable/TableColumnOption', [], function () {
    return {
        head: '',// 列头文本
        tag: '',
        width: 120,
        sort: '',// 1为排序，0为不排序
        sortTag: '',
        format: '',
        addClass: '',
        clickEvent: '',
        img: '',
        isLink: false,
        url: '',
        paras: '',
        text: '',
        target: '',
        linkList: [],
        align: '',
        headAlign: 'center',
        isOper: false,
        fixColumn: false,
        func: undefined,
        nowrap: true,
        enums: {
           // Number: {text: "数字", value: 20}
        }
    }
});
