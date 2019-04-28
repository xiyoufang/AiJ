$('#room').DataTable({
    responsive: true,
    ajax: {
        url: window.BASE_URL + "/room/page",
        type: "POST",
        data: function (d, setting) {
            d['filter'] = {};
            return d;
        }
    },
    columns: [
        {
            "data": "name",
            "title": "名称",
            "responsivePriority": 1
        }, {
            "data": "address",
            "title": "IP地址"
        },
        {
            "data": "port",
            "title": "端口"
        }, {
            "data": "enable",
            "title": "启用状态"
        },
        {
            "orderable": false,
            "data": "registered",
            "title": "创建时间"
        }
    ]
});