/// <reference path="../../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import { QueryCtrl } from 'app/plugins/sdk';
export declare class MoogsoftQueryCtrl extends QueryCtrl {
    private templateSrv;
    static templateUrl: string;
    endpointOptions: any[];
    stats: any;
    filters: any[];
    stringOptions: any[];
    /** @ngInject **/
    constructor($scope: any, $injector: any, templateSrv: any);
    endpointChanged(clearFilters: any): void;
    getFilterOptions(filter: any): any;
    clearFilters(): void;
    addFilter(filter: any): void;
}
