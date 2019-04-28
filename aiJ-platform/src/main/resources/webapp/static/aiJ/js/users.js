$('#users').DataTable({
    responsive: true,
    order : [ [ 1, 'asc' ] ],
    ajax: {
        url: window.BASE_URL + "/users/page",
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
            "data": "user_id",
            "title": "用户ID",
            "responsivePriority": 1
        },
        {
            "data": "user_name",
            "title": "名称",
            "responsivePriority": 1
        },
        {
            "data": "user_name",
            "title": "昵称"
        },
        {
            "orderable": false,
            "data": "created_source",
            "title": "来源"
        },
        {
            "orderable": false,
            "data": "created_time",
            "title": "创建时间"
        },
        {
            "orderable": false,
            "data": "activated_time",
            "title": "激活时间"
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