import { Dispatch, SetStateAction } from "react";


export type StateTuple<T> = [T, Dispatch<SetStateAction<T>>];
