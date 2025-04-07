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
	() => import('./nodes/25')
];

export const server_loads = [0,2];

export const dictionary = {
		"/": [5],
		"/dashboard/athlete": [6,[2,3]],
		"/dashboard/athlete/profile": [7,[2,3]],
		"/dashboard/athlete/questionnaires": [8,[2,3]],
		"/dashboard/athlete/questionnaires/[id]": [9,[2,3]],
		"/dashboard/athlete/settings": [10,[2,3]],
		"/dashboard/athlete/workouts": [11,[2,3]],
		"/dashboard/athlete/workouts/[id]": [12,[2,3]],
		"/dashboard/trainer": [13,[2,4]],
		"/dashboard/trainer/athletes": [14,[2,4]],
		"/dashboard/trainer/athletes/[id]": [15,[2,4]],
		"/dashboard/trainer/questionnaires": [16,[2,4]],
		"/dashboard/trainer/questionnaires/new": [19,[2,4]],
		"/dashboard/trainer/questionnaires/[id]": [17,[2,4]],
		"/dashboard/trainer/questionnaires/[id]/edit": [18,[2,4]],
		"/dashboard/trainer/settings": [20,[2,4]],
		"/dashboard/trainer/workouts": [21,[2,4]],
		"/dashboard/trainer/workouts/new": [23,[2,4]],
		"/dashboard/trainer/workouts/[id]": [22,[2,4]],
		"/login": [24],
		"/register": [25]
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