import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, FlatList, TextInput, Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

type TodoItem = {
  id: string;
  title: string;
  completed: boolean;
  isImportant?: boolean;
  isShared?: boolean;
  date?: string;
  assignees?: { avatar: string; completed?: boolean; name?: string }[];
  expanded?: boolean;
};

const TODOS: TodoItem[] = [
  {
    id: '1', title: 'Dune 2 Movie', completed: false, isImportant: true,
    date: '12 July 2024  06:30 PM',
  },
  {
    id: '2', title: 'Buy Mango', completed: true, isImportant: true,
    date: 'Today', isShared: true,
    assignees: [{ avatar: 'https://i.pravatar.cc/150?img=68', completed: true }],
  },
  {
    id: '3', title: 'Buy a thousand splendid sun Novel', completed: false,
    date: 'Today', isShared: true,
    assignees: [
      { avatar: 'https://i.pravatar.cc/150?img=45' },
      { avatar: 'https://i.pravatar.cc/150?img=13' },
      { avatar: 'https://i.pravatar.cc/150?img=44', completed: true },
      { avatar: 'https://i.pravatar.cc/150?img=15' },
    ],
    expanded: true,
  },
  { id: '4', title: 'Drink Water', completed: true, date: 'Today' },
  {
    id: '5', title: 'Dune 2 Movie', completed: false, isShared: true,
    assignees: [{ avatar: 'https://i.pravatar.cc/150?img=15' }],
  },
  {
    id: '6', title: 'Buy Mango', completed: false, isShared: true, date: 'Today',
    assignees: [{ avatar: 'https://i.pravatar.cc/150?img=68' }],
  },
];

// Helper functions for calendar
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const getMonthName = (month: number) => {
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  return months[month];
};

const getDayName = (day: number) => {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[day];
};

const TodoListScreen = ({ navigation, route }: { navigation?: any; route?: any }) => {
  const isShared = route?.params?.isShared ?? false;
  const title = isShared ? 'Shared Todo List' : 'Todo List';

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today.getDate());

  const [todos, setTodos] = useState<TodoItem[]>(TODOS);
  const [expandedIds, setExpandedIds] = useState<string[]>(['3']);
  const [showCalendar, setShowCalendar] = useState(!isShared);

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dayOfWeek = (firstDay + i - 1) % 7;
      days.push({
        date: i,
        dayName: getDayName(dayOfWeek),
        isToday: i === today.getDate() && 
                 currentMonth === today.getMonth() && 
                 currentYear === today.getFullYear()
      });
    }
    return days;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const SHARED_ASSIGNEE_NAMES = [
    { name: 'Rahul Sharma', avatar: 'https://i.pravatar.cc/150?img=45', completed: false },
    { name: 'Anjali Gupta', avatar: 'https://i.pravatar.cc/150?img=13', completed: false },
    { name: 'Aliya Mehera', avatar: 'https://i.pravatar.cc/150?img=44', completed: true },
    { name: 'Samreen Kaur', avatar: 'https://i.pravatar.cc/150?img=15', completed: false },
  ];

  const renderTodo = (item: TodoItem) => {
    const isExpanded = expandedIds.includes(item.id);
    const hasExpandableAssignees = isShared && (item.assignees?.length ?? 0) > 1;

    return (
      <View key={item.id} style={styles.todoItem}>
        <View style={styles.todoRow}>
          {/* Checkbox or star */}
          {item.isImportant && !isShared ? (
            <TouchableOpacity onPress={() => toggleTodo(item.id)}>
              <Image 
                source={item.completed ? require('../../../assets/images/chat/star-filled.png') : require('../../../assets/images/chat/star-outline.png')}
                style={styles.iconStar}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => toggleTodo(item.id)} style={styles.checkbox}>
              {item.completed && (
                <Image source={require('../../../assets/images/chat/check.png')} style={styles.iconCheck} />
              )}
            </TouchableOpacity>
          )}

          <View style={styles.todoContent}>
            <Text style={[styles.todoTitle, item.completed && styles.todoTitleDone]}>
              {item.title}
            </Text>

            {/* Assignees + date row */}
            <View style={styles.metaRow}>
              {item.isShared && item.assignees && (
                <View style={styles.assigneesRow}>
                  {/* Upload/Download icon */}
                  <View style={[styles.actionTag, { backgroundColor: item.completed ? '#2196F3' : '#e03131' }]}>
                    <Image 
                      source={item.completed ? require('../../../assets/images/chat/download.png') : require('../../../assets/images/chat/upload.png')}
                      style={styles.iconAction}
                    />
                  </View>
                  {/* Avatars (collapsed) */}
                  {!isExpanded && item.assignees.slice(0, 3).map((a, i) => (
                    a.completed ? (
                      <View key={i} style={styles.assigneeAvatar}>
                        <Image source={{ uri: a.avatar }} style={styles.assigneeImg} />
                        <View style={styles.completedBadge}>
                          <Image source={require('../../../assets/images/chat/check-small.png')} style={styles.iconCheckSmall} />
                        </View>
                      </View>
                    ) : (
                      <Image key={i} source={{ uri: a.avatar }} style={styles.assigneeImg} />
                    )
                  ))}
                  {/* Expand/collapse if multiple */}
                  {hasExpandableAssignees && (
                    <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                      <Image 
                        source={isExpanded ? require('../../../assets/images/chat/chevron-up.png') : require('../../../assets/images/chat/chevron-down.png')}
                        style={styles.iconChevron}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {item.date && <Text style={styles.dateText}>{item.date}</Text>}
              {isShared && item.completed && (
                <Text style={styles.completedByText}>• Completed by</Text>
              )}
              {isShared && item.completed && item.assignees?.[0] && (
                <Image source={{ uri: item.assignees[0].avatar }} style={styles.completedByAvatar} />
              )}
            </View>

            {/* Expanded assignee list (Shared Todo) */}
            {isExpanded && isShared && item.assignees && item.assignees.length > 1 && (
              <View style={styles.expandedList}>
                {SHARED_ASSIGNEE_NAMES.map((a, i) => (
                  <View key={i} style={styles.expandedRow}>
                    <View style={[styles.actionTag, { backgroundColor: '#e03131' }]}>
                      <Image source={require('../../../assets/images/chat/upload.png')} style={styles.iconAction} />
                    </View>
                    {a.completed ? (
                      <View style={styles.assigneeAvatar}>
                        <Image source={{ uri: a.avatar }} style={styles.assigneeImgSm} />
                        <View style={styles.completedBadge}>
                          <Image source={require('../../../assets/images/chat/check-small.png')} style={styles.iconCheckSmall} />
                        </View>
                      </View>
                    ) : (
                      <Image source={{ uri: a.avatar }} style={styles.assigneeImgSm} />
                    )}
                    <Text style={[styles.assigneeName, a.completed && styles.assigneeNameDone]}>{a.name}</Text>
                    {!a.completed && (
                      <Image source={require('../../../assets/images/chat/bell.png')} style={styles.iconBell} />
                    )}
                  </View>
                ))}
                <TouchableOpacity onPress={() => toggleExpand(item.id)} style={styles.collapseRow}>
                  <Text style={styles.dateText}>{item.date}</Text>
                  <Image source={require('../../../assets/images/chat/chevron-up.png')} style={styles.iconChevron} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const calendarDays = generateCalendarDays();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <Image source={require('../../../assets/images/chat/back.png')} style={styles.iconBack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation?.navigate('AddTodo')}>
          <Image source={require('../../../assets/images/chat/add.png')} style={styles.iconPlus} />
        </TouchableOpacity>
      </View>

      {/* Calendar strip (only for regular Todo List) */}
      {showCalendar && (
        <View style={styles.calendarWrap}>
          <View style={styles.monthRow}>
            <TouchableOpacity onPress={handlePrevMonth}>
              <Image source={require('../../../assets/images/chat/chevron-left.png')} style={styles.iconMonthNav} />
            </TouchableOpacity>
            <View>
              <Text style={styles.monthName}>{getMonthName(currentMonth)}</Text>
              <Text style={styles.monthYear}>{currentYear}</Text>
            </View>
            <TouchableOpacity onPress={handleNextMonth}>
              <Image source={require('../../../assets/images/chat/chevron-right.png')} style={styles.iconMonthNav} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysStrip}>
            {calendarDays.map((day, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.dayItem, selectedDate === day.date && styles.dayItemActive]}
                onPress={() => setSelectedDate(day.date)}
              >
                <Text style={[styles.dayLabel, selectedDate === day.date && styles.dayLabelActive]}>
                  {day.dayName}
                </Text>
                <Text style={[styles.dayNum, selectedDate === day.date && styles.dayNumActive]}>
                  {day.date}
                </Text>
                {/* dot indicator for days with tasks */}
                {day.isToday && (
                  <View style={[styles.dayDot, selectedDate === day.date && { backgroundColor: '#fff' }]} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.calendarDivider} />
        </View>
      )}

      {/* Todo list */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {todos.map(item => renderTodo(item))}
      </ScrollView>
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
  backBtn: { padding: 4 },
  iconBack: { width: 24, height: 24, tintColor: '#1a1a1a' },
  headerTitle: { fontSize: 18, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a' },
  addBtn: { padding: 4 },
  iconPlus: { width: 24, height: 24, tintColor: '#1a1a1a' },

  // Calendar
  calendarWrap: { backgroundColor: '#fff' },
  monthRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 12,
  },
  iconMonthNav: { width: 20, height: 20, tintColor: '#555' },
  monthName: { fontSize: 16, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a', textAlign: 'center' },
  monthYear: { fontSize: 13, fontFamily: 'SofiaSansCondensed-Regular', color: '#aaa', textAlign: 'center' },
  daysStrip: { paddingHorizontal: 6, paddingVertical: 12, gap: 6 },
  dayItem: {
    width: 52, paddingVertical: 8, borderRadius: 12, alignItems: 'center',
    backgroundColor: '#e8f2ff',
  },
  dayItemActive: { backgroundColor: '#1a2a3a' },
  dayLabel: { fontSize: 11, fontFamily: 'SofiaSansCondensed-Regular', color: '#e03131', marginBottom: 2 },
  dayLabelActive: { color: '#fff' },
  dayNum: { fontSize: 18, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a' },
  dayNumActive: { color: '#fff' },
  dayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#1a2a3a', marginTop: 3 },
  calendarDivider: { height: 0.5, backgroundColor: '#e8e8e8', marginTop: 4 },

  // List
  list: { flex: 1 },
  todoItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#f5f5f5' },
  todoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },

  // Checkbox
  checkbox: {
    width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: '#555',
    justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  iconCheck: { width: 14, height: 14, tintColor: '#4CAF50' },
  iconStar: { width: 22, height: 22, marginTop: 2 },

  todoContent: { flex: 1 },
  todoTitle: { fontSize: 17, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a', marginBottom: 5 },
  todoTitleDone: { textDecorationLine: 'line-through', color: '#aaa' },

  // Meta
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  assigneesRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionTag: {
    width: 22, height: 22, borderRadius: 4, justifyContent: 'center', alignItems: 'center',
  },
  iconAction: { width: 12, height: 12, tintColor: '#fff' },
  assigneeImg: { width: 22, height: 22, borderRadius: 11 },
  assigneeImgSm: { width: 20, height: 20, borderRadius: 10 },
  assigneeAvatar: { position: 'relative', width: 22, height: 22 },
  completedBadge: {
    position: 'absolute', bottom: -2, right: -2, width: 12, height: 12,
    borderRadius: 6, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center',
  },
  iconCheckSmall: { width: 8, height: 8, tintColor: '#fff' },
  iconChevron: { width: 14, height: 14, tintColor: '#888' },
  dateText: { fontSize: 13, fontFamily: 'SofiaSansCondensed-Regular', color: '#aaa' },
  completedByText: { fontSize: 13, color: '#aaa', fontFamily: 'SofiaSansCondensed-Regular' },
  completedByAvatar: { width: 20, height: 20, borderRadius: 10 },

  // Expanded list
  expandedList: { marginTop: 8 },
  expandedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  assigneeName: { flex: 1, fontSize: 15, fontFamily: 'SofiaSansCondensed-Regular', color: '#1a1a1a' },
  assigneeNameDone: { textDecorationLine: 'line-through', color: '#aaa' },
  iconBell: { width: 16, height: 16, tintColor: '#888' },
  collapseRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
});

export default TodoListScreen;
