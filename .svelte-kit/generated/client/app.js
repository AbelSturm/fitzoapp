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
	() => import('./nodes/29'),
	() => import('./nodes/30'),
	() => import('./nodes/31'),
	() => import('./nodes/32'),
	() => import('./nodes/33'),
	() => import('./nodes/34')
];

export const server_loads = [0,2];

export const dictionary = {
		"/": [6],
		"/dashboard/admin": [7,[2,3]],
		"/dashboard/admin/questionnaires": [8,[2,3]],
		"/dashboard/admin/questionnaires/[id]": [9,[2,3]],
		"/dashboard/admin/statistics": [10,[2,3]],
		"/dashboard/admin/users": [11,[2,3]],
		"/dashboard/admin/users/[id]": [12,[2,3]],
		"/dashboard/admin/workouts": [13,[2,3]],
		"/dashboard/admin/workouts/[id]": [14,[2,3]],
		"/dashboard/athlete": [15,[2,4]],
		"/dashboard/athlete/profile": [16,[2,4]],
		"/dashboard/athlete/questionnaires": [17,[2,4]],
		"/dashboard/athlete/questionnaires/[id]": [18,[2,4]],
		"/dashboard/athlete/settings": [19,[2,4]],
		"/dashboard/athlete/workouts": [20,[2,4]],
		"/dashboard/athlete/workouts/[id]": [21,[2,4]],
		"/dashboard/trainer": [22,[2,5]],
		"/dashboard/trainer/athletes": [23,[2,5]],
		"/dashboard/trainer/athletes/[id]": [24,[2,5]],
		"/dashboard/trainer/questionnaires": [25,[2,5]],
		"/dashboard/trainer/questionnaires/new": [28,[2,5]],
		"/dashboard/trainer/questionnaires/[id]": [26,[2,5]],
		"/dashboard/trainer/questionnaires/[id]/edit": [27,[2,5]],
		"/dashboard/trainer/settings": [29,[2,5]],
		"/dashboard/trainer/workouts": [30,[2,5]],
		"/dashboard/trainer/workouts/new": [32,[2,5]],
		"/dashboard/trainer/workouts/[id]": [31,[2,5]],
		"/login": [33],
		"/register": [34]
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