import time

import psutil

from schemas import SystemResponse

_START = time.time()


def get_system_data() -> SystemResponse:
    vm = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    return SystemResponse(
        cpu_percent=psutil.cpu_percent(interval=0.1),
        ram_percent=vm.percent,
        ram_used_gb=round(vm.used / (1024**3), 2),
        ram_total_gb=round(vm.total / (1024**3), 2),
        disk_percent=disk.percent,
        disk_used_gb=round(disk.used / (1024**3), 2),
        disk_total_gb=round(disk.total / (1024**3), 2),
        uptime_seconds=int(time.time() - _START),
        status='OPERATIONAL',
    )
