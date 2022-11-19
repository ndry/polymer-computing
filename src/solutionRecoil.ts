import { atom } from "recoil";
import { newTetrahedronTwoRobots as solution } from "./hardcodedSolutions";

export const solutionRecoil = atom({
    key: "solution",
    default: solution,
})