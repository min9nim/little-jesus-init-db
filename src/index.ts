import fs from 'fs'
import YAML from 'yaml'
import {req} from './utils'
import gql from 'graphql-tag'

const file = fs.readFileSync(__dirname + '/data.yml', 'utf8')
const json = YAML.parse(file)

async function initDB(json){
  for (const teacherName of Object.keys(json)) {
    console.log({teacherName})
    await req(
      gql`
        mutation($name: String!) {
          res: createTeacher(name: $name) {
            name
          }
        }
      `,
      {
        name: teacherName,
      }
    )
    json[teacherName].forEach(async studentName => {
      console.log('\t' + studentName)
      await req(
        gql`
          mutation($name: String!) {
            res: createStudent(name: $name) {
              name
            }
          }
        `,
        {
          name: studentName,
        }
      )
      await req(
        gql`
          mutation($teacherName: String!, $studentName: String!) {
            addStudentToTeacherByName(teacherName: $teacherName, studentName: $studentName) {
              name
            }
          }
        `,
        {
          teacherName,
          studentName,
        }
      )
    })
  }
  console.log('All students inserted successfully')
}

initDB(json)
