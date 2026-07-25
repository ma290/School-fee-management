import React, { useState, useEffect } from 'react';
import { ClassSection, Collection, FeeDemand, FeeType, SchoolInfo, Student } from './types';
import {
  loadClasses,
  loadCollections,
  loadFeeDemands,
  loadFeeTypes,
  loadSchoolInfo,
  loadStudents,
  saveClasses,
  saveCollections,
  saveFeeDemands,
  saveFeeTypes,
  saveSchoolInfo,
  saveStudents,
} from './utils/storage';

import { AnimatePresence, motion } from 'motion/react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { CollectFeeView } from './components/CollectFeeView';
import { StudentsView } from './components/StudentsView';
import { FeeManagementView } from './components/FeeManagementView';
import { ClassManagementView } from './components/ClassManagementView';
import { DueRegisterView } from './components/DueRegisterView';
import { CollectionRegisterView } from './components/CollectionRegisterView';
import { ReportsView } from './components/ReportsView';
import { ReceiptModal } from './components/ReceiptModal';

export default function App() {
  // Application Primary State
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(loadSchoolInfo);
  const [classes, setClasses] = useState<ClassSection[]>(loadClasses);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>(loadFeeTypes);
  const [students, setStudents] = useState<Student[]>(loadStudents);
  const [feeDemands, setFeeDemands] = useState<FeeDemand[]>(loadFeeDemands);
  const [collections, setCollections] = useState<Collection[]>(loadCollections);

  // Active UI Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals / Triggers State
  const [collectFeeStudentId, setCollectFeeStudentId] = useState<string | undefined>(undefined);
  const [viewingReceipt, setViewingReceipt] = useState<Collection | null>(null);

  // Save changes to localStorage when state updates
  useEffect(() => {
    saveSchoolInfo(schoolInfo);
  }, [schoolInfo]);

  useEffect(() => {
    saveClasses(classes);
  }, [classes]);

  useEffect(() => {
    saveFeeTypes(feeTypes);
  }, [feeTypes]);

  useEffect(() => {
    saveStudents(students);
  }, [students]);

  useEffect(() => {
    saveFeeDemands(feeDemands);
  }, [feeDemands]);

  useEffect(() => {
    saveCollections(collections);
  }, [collections]);

  // Handlers
  const handleOpenCollectFee = (studentId?: string) => {
    setCollectFeeStudentId(studentId);
    setActiveTab('collect-fee');
  };

  const handleOpenAddStudent = () => {
    setActiveTab('students');
  };

  const handleSaveStudent = (student: Student) => {
    setStudents((prev) => {
      const exists = prev.some((s) => s.id === student.id);
      if (exists) {
        return prev.map((s) => (s.id === student.id ? student : s));
      }
      return [student, ...prev];
    });
  };

  const handleSaveFeeType = (feeType: FeeType) => {
    setFeeTypes((prev) => [feeType, ...prev]);
  };

  const handleSaveClass = (cls: ClassSection) => {
    setClasses((prev) => [...prev, cls]);
  };

  const handleSaveCollection = (newCollection: Collection, updatedDemands: FeeDemand[]) => {
    setCollections((prev) => [newCollection, ...prev]);
    setFeeDemands(updatedDemands);
  };

  const handleGenerateBulkDemands = (newDemands: FeeDemand[]) => {
    setFeeDemands((prev) => [...newDemands, ...prev]);
  };

  const handleSearchSelectStudent = (student: Student) => {
    handleOpenCollectFee(student.id);
  };

  const unpaidCount = feeDemands.filter((d) => d.status === 'UNPAID' || d.status === 'OVERDUE').length;

  return (
    <div className="min-h-screen text-slate-100 selection:bg-emerald-500 selection:text-white flex flex-col relative">
      
      {/* Top Header Bar */}
      <Header
        schoolInfo={schoolInfo}
        students={students}
        collections={collections}
        feeDemands={feeDemands}
        classes={classes}
        onOpenAddStudent={handleOpenAddStudent}
        onOpenCollectFee={handleOpenCollectFee}
        onSelectTab={setActiveTab}
        onSearchSelectStudent={handleSearchSelectStudent}
      />

      {/* Main Navigation Segmented Bar */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unpaidCount={unpaidCount}
      />

      {/* Primary Workspace View Switcher */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 w-full flex-grow flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-grow flex flex-col"
          >
            {activeTab === 'dashboard' && (
              <Dashboard
                schoolInfo={schoolInfo}
                students={students}
                classes={classes}
                feeTypes={feeTypes}
                feeDemands={feeDemands}
                collections={collections}
                onOpenCollectFee={handleOpenCollectFee}
                onOpenAddStudent={handleOpenAddStudent}
                onSelectTab={setActiveTab}
                onViewReceipt={setViewingReceipt}
              />
            )}

            {activeTab === 'collect-fee' && (
              <CollectFeeView
                schoolInfo={schoolInfo}
                students={students}
                classes={classes}
                feeDemands={feeDemands}
                collections={collections}
                initialStudentId={collectFeeStudentId}
                onSaveCollection={handleSaveCollection}
                onViewReceipt={setViewingReceipt}
              />
            )}

            {activeTab === 'students' && (
              <StudentsView
                schoolInfo={schoolInfo}
                students={students}
                classes={classes}
                feeDemands={feeDemands}
                collections={collections}
                onSaveStudent={handleSaveStudent}
                onOpenCollectFee={handleOpenCollectFee}
                onViewReceipt={setViewingReceipt}
              />
            )}

            {activeTab === 'fee-management' && (
              <FeeManagementView
                schoolInfo={schoolInfo}
                classes={classes}
                feeTypes={feeTypes}
                students={students}
                feeDemands={feeDemands}
                onSaveFeeType={handleSaveFeeType}
                onGenerateBulkDemands={handleGenerateBulkDemands}
              />
            )}

            {activeTab === 'classes' && (
              <ClassManagementView
                classes={classes}
                students={students}
                onSaveClass={handleSaveClass}
              />
            )}

            {activeTab === 'due-register' && (
              <DueRegisterView
                schoolInfo={schoolInfo}
                classes={classes}
                students={students}
                feeTypes={feeTypes}
                feeDemands={feeDemands}
                onOpenCollectFee={handleOpenCollectFee}
              />
            )}

            {activeTab === 'collection-register' && (
              <CollectionRegisterView
                schoolInfo={schoolInfo}
                collections={collections}
                onViewReceipt={setViewingReceipt}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                schoolInfo={schoolInfo}
                classes={classes}
                students={students}
                feeTypes={feeTypes}
                feeDemands={feeDemands}
                collections={collections}
                onOpenCollectFee={handleOpenCollectFee}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Printable Receipt Modal Overlay */}
      {viewingReceipt && (
        <ReceiptModal
          collection={viewingReceipt}
          schoolInfo={schoolInfo}
          onClose={() => setViewingReceipt(null)}
        />
      )}

    </div>
  );
}
