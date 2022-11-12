import { atom } from "recoil";
import { shortTestSolution as solution } from "./hardcodedSolutions";

export const solutionRecoil = atom({
    key: "solution",
    default: solution,
})