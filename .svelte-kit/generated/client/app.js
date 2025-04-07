export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18'),
	() => import('./nodes/19'),
	() => import('./nodes/20'),
	() => import('./nodes/21'),
	() => import('./nodes/22'),
	() => import('./nodes/23'),
	() => import('./nodes/24'),
	() => import('./nodes/25'),
	() => import('./nodes/26'),
	() => import('./nodes/27'),
	() => import('./nodes/28'),
	() => import('./nodes/29')
];

export const server_loads = [0,2];

export const dictionary = {
		"/": [6],
		"/dashboard/admin": [7,[2,3]],
		"/dashboard/admin/users": [8,[2,3]],
		"/dashboard/admin/users/[id]": [9,[2,3]],
		"/dashboard/athlete": [10,[2,4]],
		"/dashboard/athlete/profile": [11,[2,4]],
		"/dashboard/athlete/questionnaires": [12,[2,4]],
		"/dashboard/athlete/questionnaires/[id]": [13,[2,4]],
		"/dashboard/athlete/settings": [14,[2,4]],
		"/dashboard/athlete/workouts": [15,[2,4]],
		"/dashboard/athlete/workouts/[id]": [16,[2,4]],
		"/dashboard/trainer": [17,[2,5]],
		"/dashboard/trainer/athletes": [18,[2,5]],
		"/dashboard/trainer/athletes/[id]": [19,[2,5]],
		"/dashboard/trainer/questionnaires": [20,[2,5]],
		"/dashboard/trainer/questionnaires/new": [23,[2,5]],
		"/dashboard/trainer/questionnaires/[id]": [21,[2,5]],
		"/dashboard/trainer/questionnaires/[id]/edit": [22,[2,5]],
		"/dashboard/trainer/settings": [24,[2,5]],
		"/dashboard/trainer/workouts": [25,[2,5]],
		"/dashboard/trainer/workouts/new": [27,[2,5]],
		"/dashboard/trainer/workouts/[id]": [26,[2,5]],
		"/login": [28],
		"/register": [29]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
	
	reroute: (() => {}),
	transport: {}
};

export const decoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.decode]));

export const hash = false;

export const decode = (type, value) => decoders[type](value);

export { default as root } from '../root.svelte';