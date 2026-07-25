import {
  initialClasses,
  initialCollections,
  initialFeeDemands,
  initialFeeTypes,
  initialSchoolInfo,
  initialStudents,
} from '../data/mockData';
import { ClassSection, Collection, FeeDemand, FeeType, SchoolInfo, Student } from '../types';

const STORAGE_KEYS = {
  SCHOOL_INFO: 'sms_school_info',
  CLASSES: 'sms_classes',
  FEE_TYPES: 'sms_fee_types',
  STUDENTS: 'sms_students',
  FEE_DEMANDS: 'sms_fee_demands',
  COLLECTIONS: 'sms_collections',
};

export function loadSchoolInfo(): SchoolInfo {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SCHOOL_INFO);
    return data ? JSON.parse(data) : initialSchoolInfo;
  } catch (e) {
    return initialSchoolInfo;
  }
}

export function saveSchoolInfo(info: SchoolInfo) {
  localStorage.setItem(STORAGE_KEYS.SCHOOL_INFO, JSON.stringify(info));
}

export function loadClasses(): ClassSection[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CLASSES);
    return data ? JSON.parse(data) : initialClasses;
  } catch (e) {
    return initialClasses;
  }
}

export function saveClasses(classes: ClassSection[]) {
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
}

export function loadFeeTypes(): FeeType[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FEE_TYPES);
    return data ? JSON.parse(data) : initialFeeTypes;
  } catch (e) {
    return initialFeeTypes;
  }
}

export function saveFeeTypes(feeTypes: FeeType[]) {
  localStorage.setItem(STORAGE_KEYS.FEE_TYPES, JSON.stringify(feeTypes));
}

export function loadStudents(): Student[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return data ? JSON.parse(data) : initialStudents;
  } catch (e) {
    return initialStudents;
  }
}

export function saveStudents(students: Student[]) {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
}

export function loadFeeDemands(): FeeDemand[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FEE_DEMANDS);
    return data ? JSON.parse(data) : initialFeeDemands;
  } catch (e) {
    return initialFeeDemands;
  }
}

export function saveFeeDemands(demands: FeeDemand[]) {
  localStorage.setItem(STORAGE_KEYS.FEE_DEMANDS, JSON.stringify(demands));
}

export function loadCollections(): Collection[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
    return data ? JSON.parse(data) : initialCollections;
  } catch (e) {
    return initialCollections;
  }
}

export function saveCollections(collections: Collection[]) {
  localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
}

export function resetToDemoData() {
  localStorage.setItem(STORAGE_KEYS.SCHOOL_INFO, JSON.stringify(initialSchoolInfo));
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(initialClasses));
  localStorage.setItem(STORAGE_KEYS.FEE_TYPES, JSON.stringify(initialFeeTypes));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(initialStudents));
  localStorage.setItem(STORAGE_KEYS.FEE_DEMANDS, JSON.stringify(initialFeeDemands));
  localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(initialCollections));
  window.location.reload();
}
