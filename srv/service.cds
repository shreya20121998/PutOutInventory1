using { mydb} from '../db/schema';



service inventoryService {
    entity Material as projection on mydb.Material;

    entity Category as projection on mydb.Category;
    
    entity StorageLocation as projection on mydb.StorageLocation;

    entity Subcomponent as projection on mydb.Subcomponent;


    entity Material_Status as projection on mydb.Material_Status;

    entity serviceRequest as projection on mydb.serviceRequest;

    entity rqMaterial as projection on mydb.rqMaterial;
    
    entity rqSubMaterial as projection on mydb.rqSubMaterial
    entity splitMaterilalTable as projection on mydb.splitMaterilalTable;
    entity splitSubMaterialTable as projection on mydb.splitSubMaterialTable;
        
    

    

}