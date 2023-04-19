import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { supabase } from '../supabase';

export interface TodoItem {
  id: number;
  name: string;
  isCompleted: boolean;
}

export interface TodoListState {
  todoItems: TodoItem[];
}

@Injectable({
  providedIn: 'root',
})
export class TodoListService {
  state = new BehaviorSubject<TodoListState>({ todoItems: [] });
  todoItems$: Observable<TodoItem[]> = this.state
    .asObservable()
    .pipe(map((state) => state.todoItems));

  async deleteTodo(todoItemId: number) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', todoItemId);
    if (error) {
      throw error;
    }
    const newTodoList = this.state.value.todoItems.filter(
      (todo) => todo.id !== todoItemId
    );
    this.state.next({ ...this.state.value, todoItems: newTodoList });
  }

  async fetchTodoItems() {
    const { data, error } = await supabase.from('todos').select();

    if (error) {
      throw error;
    }

    this.state.next({
      todoItems:
        data?.map(
          ({ id, name, is_completed }) =>
            ({ id: id, name, isCompleted: is_completed } as TodoItem)
        ) ?? [],
    });
  }

  async saveTodo(todoItemToSave: TodoItem) {
    // update
    if (todoItemToSave.id) {
      const { error } = await supabase.from('todos').upsert({
        id: todoItemToSave.id,
        name: todoItemToSave.name,
        is_completed: todoItemToSave.isCompleted,
      });

      if (error) {
        throw error;
      }

      const updatedTodoList = this.state.value.todoItems.map((todoItem) => {
        if (todoItem.id === todoItemToSave.id) {
          return todoItemToSave;
        }
        return todoItem;
      });

      this.state.next({
        ...this.state.value,
        todoItems: [...updatedTodoList],
      });
    } else {
      // create
      const newTodoItem = {
        ...todoItemToSave,
        id: crypto.getRandomValues(new Uint32Array(1))[0],
      } as TodoItem;
      this.state.next({
        ...this.state.value,
        todoItems: [...this.state.value.todoItems, newTodoItem],
      });

      const { error } = await supabase.from('todos').insert({
        id: newTodoItem.id,
        name: newTodoItem.name,
        is_completed: false,
      });

      if (error) {
        throw error;
      }
    }
  }
}
