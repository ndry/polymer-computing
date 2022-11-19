import { atom } from "recoil";
import { fishSolution as solution } from "./hardcodedSolutions";

export const solutionRecoil = atom({
    key: "solution",
    default: solution,
})