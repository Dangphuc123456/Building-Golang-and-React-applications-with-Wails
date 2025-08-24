export namespace models {
	
	export class RepairHistory {
	    id: number;
	    repair_date: string;
	    issue_description: string;
	    cost: number;
	    technician_id?: number;
	    maintenance_id?: number;
	    created_at: string;
	
	    static createFrom(source: any = {}) {
	        return new RepairHistory(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.repair_date = source["repair_date"];
	        this.issue_description = source["issue_description"];
	        this.cost = source["cost"];
	        this.technician_id = source["technician_id"];
	        this.maintenance_id = source["maintenance_id"];
	        this.created_at = source["created_at"];
	    }
	}
	export class MaintenanceSchedule {
	    id: number;
	    equipment_id: number;
	    scheduled_date: string;
	    description: string;
	    status: string;
	    technician_id?: number;
	    created_at: string;
	    repair_histories: RepairHistory[];
	
	    static createFrom(source: any = {}) {
	        return new MaintenanceSchedule(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.equipment_id = source["equipment_id"];
	        this.scheduled_date = source["scheduled_date"];
	        this.description = source["description"];
	        this.status = source["status"];
	        this.technician_id = source["technician_id"];
	        this.created_at = source["created_at"];
	        this.repair_histories = this.convertValues(source["repair_histories"], RepairHistory);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Equipment {
	    id: number;
	    name: string;
	    purchase_date: string;
	    status: string;
	    supplier_id?: number;
	    price: number;
	    created_at: string;
	    schedules: MaintenanceSchedule[];
	
	    static createFrom(source: any = {}) {
	        return new Equipment(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.purchase_date = source["purchase_date"];
	        this.status = source["status"];
	        this.supplier_id = source["supplier_id"];
	        this.price = source["price"];
	        this.created_at = source["created_at"];
	        this.schedules = this.convertValues(source["schedules"], MaintenanceSchedule);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class SearchResult {
	    id: number;
	    name: string;
	    type: string;
	
	    static createFrom(source: any = {}) {
	        return new SearchResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.type = source["type"];
	    }
	}
	export class Supplier {
	    id: number;
	    name: string;
	    phone: string;
	    email: string;
	    address: string;
	    created_at: string;
	    equipments: Equipment[];
	
	    static createFrom(source: any = {}) {
	        return new Supplier(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.phone = source["phone"];
	        this.email = source["email"];
	        this.address = source["address"];
	        this.created_at = source["created_at"];
	        this.equipments = this.convertValues(source["equipments"], Equipment);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class User {
	    id: number;
	    username: string;
	    password_hash: string;
	    role: string;
	    email: string;
	    address: string;
	    phone: string;
	    created_at: string;
	    updated_at: string;
	
	    static createFrom(source: any = {}) {
	        return new User(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.username = source["username"];
	        this.password_hash = source["password_hash"];
	        this.role = source["role"];
	        this.email = source["email"];
	        this.address = source["address"];
	        this.phone = source["phone"];
	        this.created_at = source["created_at"];
	        this.updated_at = source["updated_at"];
	    }
	}

}

