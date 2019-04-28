$('#service').DataTable({
    responsive: true,
    order : [ [ 2, 'asc' ] ],
    ajax: {
        url: window.BASE_URL + "/service/page",
        type: "POST",
        data: function (d, setting) {
            d['filter'] = {};
            return d;
        }
    },
    columns: [
        {
            "orderable": false,
            "data": "id",
            "title": "id"
        },
        {
            "data": "type",
            "title": "类型"
        },
        {
            "data": "name",
            "title": "名称",
            "responsivePriority": 1
        },
        {
            "data": "description",
            "title": "描述"
        },
        {
            "orderable": false,
            "data": "created_time",
            "title": "创建时间"
        },
        {
            "orderable": false,
            "data": "modified_time",
            "title": "运行时间"
        },
        {
            "orderable": false,
            "data": "id",
            "title": "操作",
            "responsivePriority": 1,
            render: function () {
                return "";
            }
        }
    ]
});