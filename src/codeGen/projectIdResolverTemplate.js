  ${targetObjName}(obj, args, context, ast) {
    if (context["${dataLoaderId}"] == null) {
      context["${dataLoaderId}"] = new DataLoader();
    }
  }