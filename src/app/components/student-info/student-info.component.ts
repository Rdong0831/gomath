import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpsService } from './../../services/https.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { CookieService } from 'ngx-cookie-service';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-student-info',
  templateUrl: './student-info.component.html',
  styleUrls: ['./student-info.component.scss'],

})
export class StudentInfoComponent implements OnInit {

  StudentsData: any;
  dataSource: any = [];

  constructor(
    private HttpsService: HttpsService,
    private cookieService: CookieService,
  ) {}
  displayedColumns: any = ['name', 'studentId', 'school', 'grade', 'class', 'status', 'option']
  ELE: any = []
  studentId: any = []
  school = { "name": '', "Id": '' }

  ngOnInit(): void {
    this.getStudents()
  }

  sortData(sort: Sort) {
    const data = this.dataSource.slice();
    if (!sort.active || sort.direction === '') {
      this.dataSource = data;
      return;
    }

    this.dataSource = data.sort((a:any, b:any) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'studentId': return compare(a.studentId, b.studentId, isAsc);
        default: return 0;
      }
    });
  }

  getStudents(): void {
    this.HttpsService.getStudents().subscribe(StudentsData => {
      StudentsData.forEach((element: any) => {
        var status = ''
        if (element.status == 0) {
          status = '未登入'
        } else if (element.status == 1) {
          status = '已登入'
        } else if (element.status == 2) {
          status = '作答完成'
        }
        var datas = {
          name: element.name,
          studentId: element.studentId,
          schoolName: element.schoolName,
          grade: element.grade,
          class: element.class,
          status: status,
          accountId: element.accountId
        }
        this.ELE.push(datas)
        this.school.name = datas.schoolName

      });
      this.dataSource = this.ELE
      this.HttpsService.getScores().subscribe(res => {
        res.forEach((element: any) => {
          if (this.studentId.find((elements: any) => element.studentId == elements) == undefined) {
            this.studentId.push(element.studentId)
          }
        });
      })
      this.getSchools()
    })
  }

  getSchools() {
    this.HttpsService.getSchools().subscribe(data => {
      data.forEach((element: any) => {
        if (element.name == this.school.name) {
          this.school.Id = String(element.schoolId)
        } else {
        }
      });
    })
  }

  logout(Id: any) {
    Swal.fire({
      title: '警告！',
      icon: 'warning',
      text: '確定要解鎖嗎？',
      confirmButtonText: '確定',
      showCancelButton: true,
      cancelButtonText: '取消'
    }).then(res => {
      if (res.isConfirmed) {
        var update = [{
          "op": "replace",
          "path": "/Status",
          "value": 0
        },
        {
          "op": "replace",
          "path": "/Token",
          "value": ""
        }]
        this.HttpsService.logouts(Id, update).subscribe(res => {
          Swal.fire({
            title: '成功',
            icon: 'success',
            text: '解鎖成功！',
            confirmButtonText: '好的'
          }).then((res) => {
            location.reload()
          })
        })
      }
    })
  }

  unlockAllStudent() {
    Swal.fire({
      title: '警告！',
      icon: 'warning',
      text: '確定要解鎖嗎？',
      confirmButtonText: '確定',
      showCancelButton: true,
      cancelButtonText: "取消"
    }).then(res => {
      if (res.isConfirmed) {
        this.HttpsService.unlockAllStudent(this.cookieService.get("School")).subscribe(res => {
          Swal.fire({
            title: '成功！',
            icon: 'success',
            text: '解鎖成功！',
            confirmButtonText: '確定'
          }).then(res => {
            location.reload()
          })
        })
      }
    })
  }

  delScore(studentId: any) {
    Swal.fire({
      title: '警告',
      icon: 'warning',
      text: '確定要清除作答嗎？',
      confirmButtonText: '好的',
      cancelButtonText: '取消',
      showCancelButton: true
    }).then((res) => {
      if (res.isConfirmed) {
        this.HttpsService.delStudentScore(studentId).subscribe(res => {
          Swal.fire({
            title: '成功',
            icon: 'success',
            text: '清除成功！',
            confirmButtonText: '好的'
          }).then((res) => {
            location.reload()
          })
        })
      }
    })
  }

  delStudent(studentId: any) {
    Swal.fire({
      title: '警告',
      icon: 'warning',
      text: '確定要學生資料嗎？',
      confirmButtonText: '好的',
      cancelButtonText: '取消',
      showCancelButton: true
    }).then((res) => {
      if (res.isConfirmed) {
        this.HttpsService.deleteStudent(studentId).subscribe(res => {
          Swal.fire({
            title: '成功',
            icon: 'success',
            text: '清除成功！',
            confirmButtonText: '好的'
          }).then((res) => {
            location.reload()
          })
        })
      }
    })
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
