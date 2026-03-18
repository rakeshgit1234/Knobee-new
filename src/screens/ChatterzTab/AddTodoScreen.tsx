import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Image, Modal, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const REPEAT_OPTIONS = [
  'Daily at 4:55 pm',
  'Sunday of every week',
  '14th of every Month',
  '14th Feb of every Year',
];

const INVITED_USERS = [
  { avatar: 'https://i.pravatar.cc/150?img=45' },
  { avatar: 'https://i.pravatar.cc/150?img=13' },
  { avatar: 'https://i.pravatar.cc/150?img=44' },
  { avatar: 'https://i.pravatar.cc/150?img=15' },
];

type Task = {
  id: string;
  title: string;
  invitees: typeof INVITED_USERS;
  scheduledDate: Date;
  repeat: string;
  isImportant: boolean;
};

const AddTodoScreen = ({ navigation }: { navigation?: any }) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1', title: 'Plan for Movie',
      invitees: INVITED_USERS.slice(0, 4),
      scheduledDate: new Date(2026, 1, 14, 16, 55),
      repeat: '14th of Every Month',
      isImportant: true,
    },
  ]);
  const [showRepeatFor, setShowRepeatFor] = useState<string | null>(null);
  const [showDateFor, setShowDateFor] = useState<string | null>(null);

  const addTask = () => {
    const newTask: Task = {
      id: Date.now().toString(), title: '',
      invitees: [], scheduledDate: new Date(),
      repeat: '', isImportant: false,
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const formatDate = (d: Date) =>
    `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}, ${d.getFullYear()}  ${d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: true })}`;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Image source={require('../../../assets/images/chat/back.png')} style={styles.iconBack} />
        </TouchableOpacity>
        <Text style={styles.title}>Todo List</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {tasks.map((task, taskIdx) => (
          <View key={task.id} style={styles.taskBlock}>
            {/* Title input */}
            <View style={styles.titleRow}>
              <View style={styles.checkbox} />
              <TextInput
                style={styles.taskInput}
                placeholder="Add task"
                placeholderTextColor="#bbb"
                value={task.title}
                onChangeText={v => updateTask(task.id, { title: v })}
              />
            </View>
            <View style={styles.divider} />

            {/* Invite user */}
            <TouchableOpacity style={styles.optionRow}>
              <View style={styles.optionIconWrap}>
                <Image source={require('../../../assets/images/chat/user-plus.png')} style={styles.iconOption} />
              </View>
              <Text style={styles.optionLabel}>Invite user</Text>
              {task.invitees.length > 0 && (
                <View style={styles.inviteesRow}>
                  {task.invitees.map((u, i) => (
                    <Image key={i} source={{ uri: u.avatar }} style={styles.inviteeAvatar} />
                  ))}
                </View>
              )}
            </TouchableOpacity>

            {/* Schedule Task */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setShowDateFor(showDateFor === task.id ? null : task.id)}
            >
              <View style={styles.optionIconWrap}>
                <Image source={require('../../../assets/images/chat/calender.png')} style={styles.iconOption} />
              </View>
              <Text style={styles.optionLabel}>Schedule Task</Text>
              <Text style={styles.optionValue}>{formatDate(task.scheduledDate)}</Text>
            </TouchableOpacity>
            {showDateFor === task.id && Platform.OS === 'android' && (
              <DateTimePicker
                value={task.scheduledDate}
                mode="datetime"
                onChange={(_, d) => {
                  setShowDateFor(null);
                  if (d) updateTask(task.id, { scheduledDate: d });
                }}
              />
            )}

            {/* Repeat Task */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setShowRepeatFor(showRepeatFor === task.id ? null : task.id)}
            >
              <View style={styles.optionIconWrap}>
                <Image source={require('../../../assets/images/chat/repeat.png')} style={styles.iconOption} />
              </View>
              <Text style={styles.optionLabel}>Repeat Task</Text>
              <Image 
                source={require('../../../assets/images/chat/chevron-down.png')} 
                style={styles.iconChevron} 
              />
              {task.repeat ? <Text style={styles.optionValue}>{task.repeat}</Text> : null}
            </TouchableOpacity>

            {/* Repeat dropdown */}
            {showRepeatFor === task.id && (
              <View style={styles.repeatDropdown}>
                {REPEAT_OPTIONS.map((opt, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.repeatOption, i < REPEAT_OPTIONS.length - 1 && styles.repeatOptionBorder]}
                    onPress={() => { updateTask(task.id, { repeat: opt }); setShowRepeatFor(null); }}
                  >
                    <Text style={styles.repeatOptionText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Mark as important */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => updateTask(task.id, { isImportant: !task.isImportant })}
            >
              <View style={styles.optionIconWrap}>
                <Image 
                  source={task.isImportant ? require('../../../assets/images/chat/star-filled.png') : require('../../../assets/images/chat/star-outline.png')} 
                  style={styles.iconStar} 
                />
              </View>
              <Text style={styles.optionLabel}>Mark as important</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Footer buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addAnotherBtn} onPress={addTask}>
          <Image source={require('../../../assets/images/chat/add.png')} style={styles.iconPlus} />
          <Text style={styles.addAnotherText}>Add Another</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => navigation?.goBack()}
        >
          <Text style={styles.saveBtnText}>Save Task</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14,
    borderBottomWidth: 0.5, borderBottomColor: '#e8e8e8',
  },
  iconBack: { width: 24, height: 24, tintColor: '#1a1a1a' },
  title: { fontSize: 18, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a' },

  scroll: { flex: 1 },
  taskBlock: { paddingHorizontal: 20, paddingVertical: 16, marginBottom: 8 },

  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: '#555' },
  taskInput: { flex: 1, fontSize: 18, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a' },
  divider: { height: 0.5, backgroundColor: '#e0e0e0', marginBottom: 16 },

  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 14 },
  optionIconWrap: { width: 28, alignItems: 'center' },
  iconOption: { width: 20, height: 20, tintColor: '#555' },
  iconStar: { width: 22, height: 22 },
  optionLabel: { fontSize: 16, fontFamily: 'SofiaSansCondensed-Regular', color: '#1a1a1a', flex: 1 },
  optionValue: { fontSize: 13, fontFamily: 'SofiaSansCondensed-Regular', color: '#999' },
  iconChevron: { width: 14, height: 14, tintColor: '#888', marginRight: 4,resizeMode: 'contain' },

  inviteesRow: { flexDirection: 'row', gap: 4 },
  inviteeAvatar: { width: 26, height: 26, borderRadius: 13 },

  // Repeat dropdown
  repeatDropdown: {
    marginLeft: 42, borderWidth: 1, borderColor: '#e0e0e0',
    borderRadius: 10, overflow: 'hidden', marginBottom: 8,
  },
  repeatOption: { paddingHorizontal: 16, paddingVertical: 12 },
  repeatOptionBorder: { borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  repeatOptionText: { fontSize: 15, fontFamily: 'SofiaSansCondensed-Regular', color: '#1a1a1a' },

  // Footer
  footer: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, gap: 12,
    borderTopWidth: 0.5, borderTopColor: '#f0f0f0',
  },
  addAnotherBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: '#f0f0f0',
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  iconPlus: { width: 16, height: 16, tintColor: '#555' },
  addAnotherText: { fontSize: 16, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#555' },
  saveBtn: {
    flex: 1.4, paddingVertical: 14, borderRadius: 10, backgroundColor: 'rgba(255,167,87,1)',
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 16, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a' },
});

export default AddTodoScreen;
