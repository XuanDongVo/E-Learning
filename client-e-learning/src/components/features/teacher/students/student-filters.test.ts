import { describe,expect,it } from "vitest";
import { filterStudents } from "./student-filters";
const students=[{id:1,fullName:"Alice Nguyen",email:"alice@test.com",phone:"",className:"6A1",classStatus:"ACTIVE"},{id:2,fullName:"Bob Tran",email:"bob@test.com",phone:"",className:"6A2",classStatus:"INACTIVE"}];
describe("filterStudents",()=>{it("returns all for empty search and all status",()=>expect(filterStudents(students,"","")).toHaveLength(2));it("filters name case-insensitively",()=>expect(filterStudents(students,"alice","all")).toHaveLength(1));it("filters email",()=>expect(filterStudents(students,"bob@test","all")[0].id).toBe(2));it("filters class membership status",()=>expect(filterStudents(students,"","ACTIVE")[0].id).toBe(1));});
